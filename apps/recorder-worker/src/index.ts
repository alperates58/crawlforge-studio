import express from 'express';
import { WebSocketServer, WebSocket } from 'ws';
import { chromium, Browser, BrowserContext, Page, CDPSession } from 'playwright';
import { PrismaClient } from '@crawlforge/database';
import http from 'http';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3002;

const SESSION_TIMEOUT_MS = 15 * 60 * 1000; // 15 mins

interface ActiveSession {
  id: string;
  ws: WebSocket;
  browser: Browser;
  context: BrowserContext;
  page: Page;
  cdp: CDPSession;
  timeoutId: NodeJS.Timeout;
  recordedSteps: any[];
}

const activeSessions = new Map<string, ActiveSession>();

async function stopSession(sessionId: string, reason = 'client disconnected') {
  const session = activeSessions.get(sessionId);
  if (!session) return;
  console.log(`[Recorder] Stopping session ${sessionId} (${reason})`);
  
  clearTimeout(session.timeoutId);
  
  try {
    await session.cdp.detach().catch(() => {});
    await session.context.close().catch(() => {});
    await session.browser.close().catch(() => {});
  } catch (err) {
    console.error(`[Recorder] Error closing browser for ${sessionId}:`, err);
  }

  try {
    await prisma.recorderSession.update({
      where: { id: sessionId },
      data: {
        status: 'stopped',
        stoppedAt: new Date(),
        recordedStepsJson: JSON.stringify(session.recordedSteps)
      }
    });
  } catch (err) {
    console.error(`[Recorder] DB update failed for ${sessionId}:`, err);
  }

  if (session.ws.readyState === WebSocket.OPEN) {
    session.ws.close();
  }
  
  activeSessions.delete(sessionId);
}

wss.on('connection', async (ws, req) => {
  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const sessionId = url.searchParams.get('sessionId');

  if (!sessionId) {
    ws.close(1008, 'Session ID required');
    return;
  }

  console.log(`[Recorder] Connection requested for session: ${sessionId}`);

  try {
    const dbSession = await prisma.recorderSession.findUnique({ where: { id: sessionId } });
    if (!dbSession || (dbSession.status !== 'starting' && dbSession.status !== 'running')) {
      ws.close(1008, 'Invalid or inactive session');
      return;
    }

    // Launch Playwright
    const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      deviceScaleFactor: 1
    });
    const page = await context.newPage();

    // Setup CDP Screencast
    const cdp = await context.newCDPSession(page);
    await cdp.send('Page.startScreencast', {
      format: 'jpeg',
      quality: 60,
      maxWidth: 1920,
      maxHeight: 1080,
      everyNthFrame: 1
    });

    cdp.on('Page.screencastFrame', ({ data, sessionId: screencastSessionId }) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'frame', data }));
      }
      cdp.send('Page.screencastFrameAck', { sessionId: screencastSessionId }).catch(() => {});
    });

    const timeoutId = setTimeout(() => stopSession(sessionId, 'timeout'), SESSION_TIMEOUT_MS);

    const activeSession: ActiveSession = {
      id: sessionId,
      ws,
      browser,
      context,
      page,
      cdp,
      timeoutId,
      recordedSteps: dbSession.recordedStepsJson ? JSON.parse(dbSession.recordedStepsJson) : [
        {
          id: crypto.randomUUID(),
          type: 'OPEN_URL',
          parameters: { url: dbSession.startUrl }
        }
      ]
    };

    activeSessions.set(sessionId, activeSession);

    await prisma.recorderSession.update({
      where: { id: sessionId },
      data: { status: 'running' }
    });

    ws.send(JSON.stringify({ type: 'steps_sync', steps: activeSession.recordedSteps }));

    ws.on('close', () => {
      stopSession(sessionId);
    });

    ws.on('message', async (messageData) => {
      try {
        const msg = JSON.parse(messageData.toString());
        await handleClientMessage(activeSession, msg);
      } catch (err: any) {
        console.error(`[Recorder] Message error: ${err.message}`);
      }
    });

    await page.goto(dbSession.startUrl, { waitUntil: 'domcontentloaded' });

  } catch (err: any) {
    console.error(`[Recorder] Init failed for ${sessionId}:`, err);
    ws.close(1011, 'Initialization failed');
  }
});

async function handleClientMessage(session: ActiveSession, msg: any) {
  const { page } = session;

  const appendStep = async (step: any) => {
    session.recordedSteps.push(step);
    if (session.ws.readyState === WebSocket.OPEN) {
      session.ws.send(JSON.stringify({ type: 'steps_sync', steps: session.recordedSteps }));
    }
    // Periodic DB sync
    await prisma.recorderSession.update({
      where: { id: session.id },
      data: { recordedStepsJson: JSON.stringify(session.recordedSteps) }
    }).catch(() => {});
  };

  if (msg.action === 'click') {
    const { x, y } = msg;
    const selectorInfo = await computeSelectorAt(page, x, y);
    
    await appendStep({
      id: crypto.randomUUID(),
      type: 'CLICK',
      parameters: { selector: selectorInfo.selector },
      weakSelector: selectorInfo.weak
    });

    await page.mouse.click(x, y);
  } else if (msg.action === 'extract_text') {
    const { x, y } = msg;
    const selectorInfo = await computeSelectorAt(page, x, y, true);
    
    await appendStep({
      id: crypto.randomUUID(),
      type: 'EXTRACT_TEXT',
      parameters: { 
        selector: selectorInfo.selector, 
        field_name: `text_${session.recordedSteps.length}` 
      }
    });
  } else if (msg.action === 'extract_attribute') {
    const { x, y } = msg;
    const selectorInfo = await computeSelectorAt(page, x, y, true);
    const tagName = selectorInfo.tagName || 'IMG';
    const attr = tagName === 'A' ? 'href' : 'src';
    
    await appendStep({
      id: crypto.randomUUID(),
      type: 'EXTRACT_ATTRIBUTE',
      parameters: { 
        selector: selectorInfo.selector, 
        field_name: attr === 'href' ? `link_${session.recordedSteps.length}` : `image_${session.recordedSteps.length}`,
        attribute: attr
      }
    });
  } else if (msg.action === 'type') {
    const { text } = msg;
    await appendStep({
      id: crypto.randomUUID(),
      type: 'TYPE',
      parameters: { text }
    });
    await page.keyboard.type(text, { delay: 50 });
  } else if (msg.action === 'scroll') {
    const { deltaY } = msg;
    await appendStep({
      id: crypto.randomUUID(),
      type: 'SCROLL',
      parameters: { direction: deltaY > 0 ? 'down' : 'up', amount: Math.abs(deltaY) }
    });
    await page.mouse.wheel(0, deltaY);
  } else if (msg.action === 'wait') {
    const { duration } = msg;
    await appendStep({
      id: crypto.randomUUID(),
      type: 'WAIT',
      parameters: { durationMs: duration }
    });
    await page.waitForTimeout(duration);
  } else if (msg.action === 'hover') {
    const { x, y, mode } = msg;
    if (x < 0 || y < 0) {
      await highlightElements(page, '', '');
    } else {
      const selectorInfo = await computeSelectorAt(page, x, y, true);
      await highlightElements(page, selectorInfo.selector, mode);
    }
  }
}

async function highlightElements(page: Page, selector: string, mode: string) {
  try {
    await page.evaluate(({ selector, mode }) => {
      const prev = document.querySelectorAll('.crawlforge-highlight');
      prev.forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.classList.remove('crawlforge-highlight');
        htmlEl.style.outline = '';
        htmlEl.style.outlineOffset = '';
        htmlEl.style.backgroundColor = '';
        htmlEl.style.transition = '';
      });

      if (!selector || selector === 'body' || selector === 'html') return;

      let color = '#4f46e5'; // Default Indigo
      let bg = 'rgba(79, 70, 229, 0.1)';
      if (mode === 'extract_text') {
        color = '#3b82f6'; // Blue
        bg = 'rgba(59, 130, 246, 0.15)';
      } else if (mode === 'extract_attribute') {
        color = '#10b981'; // Green
        bg = 'rgba(16, 185, 129, 0.15)';
      }

      const targets = document.querySelectorAll(selector);
      targets.forEach(el => {
        const htmlEl = el as HTMLElement;
        htmlEl.classList.add('crawlforge-highlight');
        htmlEl.style.outline = `2px dashed ${color}`;
        htmlEl.style.outlineOffset = '2px';
        htmlEl.style.backgroundColor = bg;
        htmlEl.style.transition = 'outline 0.15s ease, background-color 0.15s ease';
      });
    }, { selector, mode });
  } catch (err) {
    // Ignore errors on closed or loading pages
  }
}

async function computeSelectorAt(page: Page, x: number, y: number, preferCss = false) {
  try {
    const result = await page.evaluate(({x, y, preferCss}: { x: number, y: number, preferCss: boolean }) => {
      let el = document.elementFromPoint(x, y) as HTMLElement;
      if (!el) return { selector: 'body', weak: true, tagName: 'BODY' };

      // Overlay resolver: if the clicked element is an empty div, try to find a sibling or child img inside its parent
      if (preferCss && el.tagName === 'DIV' && !el.innerText?.trim()) {
        const parent = el.parentElement;
        if (parent) {
          const img = parent.querySelector('img');
          if (img) el = img;
        }
      }

      const tagName = el.tagName;

      // Priority: data-testid, id, name, aria-label, placeholder, text, css
      if (el.getAttribute('data-testid')) return { selector: `[data-testid="${el.getAttribute('data-testid')}"]`, weak: false, tagName };
      if (el.id) return { selector: `#${el.id}`, weak: false, tagName };
      if (el.getAttribute('name')) return { selector: `[name="${el.getAttribute('name')}"]`, weak: false, tagName };
      if (el.getAttribute('aria-label')) return { selector: `[aria-label="${el.getAttribute('aria-label')}"]`, weak: false, tagName };
      if (el.getAttribute('placeholder')) return { selector: `[placeholder="${el.getAttribute('placeholder')}"]`, weak: false, tagName };
      
      if (!preferCss) {
        const text = el.innerText?.trim();
        if (text && text.length > 0 && text.length < 80) {
          // Just escape quotes for basic text selector
          const escaped = text.replace(/"/g, '\\"');
          return { selector: `text="${escaped}"`, weak: false, tagName };
        }
      }

      // CSS Fallback
      let path = '';
      let current: HTMLElement | null = el;
      while (current && current.nodeType === Node.ELEMENT_NODE) {
        if (current.tagName === 'BODY' || current.tagName === 'HTML') {
          break;
        }
        let selector = current.nodeName.toLowerCase();
        
        // If the element has an ID, use it as an anchor, unless it's a dynamic/numeric ID and we prefer generic CSS
        if (current.id && !(preferCss && /\d/.test(current.id))) {
          selector += `#${current.id}`;
          path = selector + (path ? ' > ' + path : '');
          break;
        } else {
          // Use class names if present
          let hasClass = false;
          if (current.className && typeof current.className === 'string') {
            const classes = current.className.split(/\s+/)
              .filter(c => {
                if (!c) return false;
                // Exclude tailwind state modifiers and swiper slide indices
                if (c.startsWith('hover:') || c.startsWith('focus:') || c.includes('swiper-slide-')) return false;
                // Exclude class names containing numbers (often database IDs or layout column widths)
                if (preferCss && /\d/.test(c)) return false;
                // Exclude state and positional classes
                const lower = c.toLowerCase();
                const excludedClasses = ['first', 'last', 'even', 'odd', 'active', 'selected', 'current', 'focus', 'hover', 'disabled', 'enabled'];
                if (excludedClasses.includes(lower)) return false;
                return true;
              });
              
            if (classes.length > 0) {
              selector += '.' + classes.join('.');
              hasClass = true;
            }
          }
          
          if (!hasClass && !(preferCss && current.tagName !== 'BODY' && current.tagName !== 'HTML')) {
            let sibling = current;
            let nth = 1;
            while (sibling = sibling.previousElementSibling as HTMLElement) nth++;
            if (nth > 1) selector += `:nth-child(${nth})`;
          }
        }
        path = selector + (path ? ' > ' + path : '');
        current = current.parentElement;
      }
      return { selector: path || 'body', weak: false, tagName };
    }, { x, y, preferCss });

    return result;
  } catch (err) {
    return { selector: 'body', weak: true, tagName: 'BODY' };
  }
}

server.listen(PORT, () => {
  console.log(`[Recorder] Worker listening on port ${PORT}`);
});

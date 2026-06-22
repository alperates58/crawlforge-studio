import { chromium } from 'playwright';
import { PrismaClient } from '@crawlforge/database';
import { ExecutionContext } from './types';
import { openUrlHandler } from './handlers/openUrl';
import { clickHandler } from './handlers/click';
import { typeHandler } from './handlers/type';
import { waitHandler } from './handlers/wait';
import { scrollHandler } from './handlers/scroll';
import { extractTextHandler } from './handlers/extractText';
import { extractLinksHandler } from './handlers/extractLinks';
import { saveRecordHandler } from './handlers/saveRecord';

export async function runBot(botRun: any, prisma: PrismaClient) {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  const context: ExecutionContext = {
    page,
    prisma,
    runId: botRun.id,
    botId: botRun.botId,
    projectId: botRun.bot.projectId,
    currentUrl: '',
    currentPageTitle: '',
    variables: {},
    extractedData: {},
    links: [],
    stats: {
      pagesVisited: 0,
      recordsExtracted: 0,
    }
  };

  try {
    const steps = botRun.bot.stepsJson ? JSON.parse(botRun.bot.stepsJson) : [];
    
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`[Worker] Executing step ${i}: ${step.type}`);
      
      try {
        await executeStep(step, context);
        
        // Log success
        await prisma.botStepLog.create({
          data: {
            runId: botRun.id,
            stepIndex: i,
            stepType: step.type,
            status: 'succeeded',
          }
        });
        
      } catch (err: any) {
        // Log failure
        await prisma.botStepLog.create({
          data: {
            runId: botRun.id,
            stepIndex: i,
            stepType: step.type,
            status: 'failed',
            message: err.message || 'Unknown error in step execution',
          }
        });
        
        throw new Error(`Step ${i} (${step.type}) failed: ${err.message}`);
      }
    }
    
    return context.stats;
    
  } finally {
    await browser.close();
  }
}

async function executeStep(step: any, context: ExecutionContext) {
  switch (step.type) {
    case 'OPEN_URL':
      await openUrlHandler(step, context);
      break;
    case 'CLICK':
      await clickHandler(step, context);
      break;
    case 'TYPE':
      await typeHandler(step, context);
      break;
    case 'WAIT':
      await waitHandler(step, context);
      break;
    case 'SCROLL':
      await scrollHandler(step, context);
      break;
    case 'EXTRACT_TEXT':
      await extractTextHandler(step, context);
      break;
    case 'EXTRACT_LINKS':
      await extractLinksHandler(step, context);
      break;
    case 'SAVE_RECORD':
      await saveRecordHandler(step, context);
      break;
    default:
      throw new Error(`Unsupported step type: ${step.type}`);
  }
}

import { ExecutionContext } from '../types';

export async function loopLinksHandler(step: any, context: ExecutionContext) {
  const sourceField = step.source_field;
  if (!sourceField) throw new Error('source_field is required for LOOP_LINKS');

  let urls = context.extractedData[sourceField];
  if (!urls) {
    console.log(`[LOOP_LINKS] No data found in context for ${sourceField}. Skipping.`);
    return;
  }

  if (!Array.isArray(urls)) {
    urls = [urls];
  }

  const maxItems = step.max_items || 50;
  const hardMaxItems = 500;
  const limit = Math.min(maxItems, hardMaxItems);
  const nestedSteps = step.steps || [];

  // Normalize & Deduplicate
  const baseUrl = new URL(context.page.url()).origin;
  const uniqueUrls = new Set<string>();

  for (let u of urls) {
    if (typeof u !== 'string') continue;
    let normalizedUrl = u;
    if (normalizedUrl.startsWith('/')) {
      normalizedUrl = `${baseUrl}${normalizedUrl}`;
    }
    uniqueUrls.add(normalizedUrl);
  }

  const urlsToProcess = Array.from(uniqueUrls).slice(0, limit);
  console.log(`[LOOP_LINKS] Processing ${urlsToProcess.length} items (limit: ${limit})`);

  for (let i = 0; i < urlsToProcess.length; i++) {
    const targetUrl = urlsToProcess[i];
    const itemIndex = i + 1;
    console.log(`[LOOP_LINKS] Item ${itemIndex}: ${targetUrl}`);

    // Create a new isolated tab for this item
    const newPage = await context.page.context().newPage();
    
    // Fork the context for the nested execution
    const isolatedContext: ExecutionContext = {
      ...context,
      page: newPage,
      currentUrl: targetUrl,
      currentPageTitle: '',
      extractedData: { ...context.extractedData } // inherit data, but local modifications won't bleed upwards (unless we want them to, but usually we just want SAVE_RECORD to read them). Actually, we DO want dataset SAVE_RECORD to just work.
    };

    try {
      await isolatedContext.page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
      isolatedContext.currentUrl = isolatedContext.page.url();
      isolatedContext.currentPageTitle = await isolatedContext.page.title();
      isolatedContext.stats.pagesVisited++;

      // Execute nested steps
      if (context.executeSteps && nestedSteps.length > 0) {
        await context.executeSteps(nestedSteps, isolatedContext, { itemIndex });
      }

    } catch (e: any) {
      console.error(`[LOOP_LINKS] Failed processing item ${itemIndex} (${targetUrl}): ${e.message}`);
      // Isolated failure, do not throw. Proceed to next item.
    } finally {
      await newPage.close();
    }
  }
}

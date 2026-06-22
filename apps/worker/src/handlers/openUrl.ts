import { ExecutionContext } from '../types';

export async function openUrlHandler(step: any, context: ExecutionContext) {
  if (!step.url) {
    throw new Error('URL is required for OPEN_URL step');
  }
  
  await context.page.goto(step.url, { waitUntil: 'domcontentloaded' });
  context.currentUrl = context.page.url();
  context.currentPageTitle = await context.page.title();
  context.stats.pagesVisited += 1;
}

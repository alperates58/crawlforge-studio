import { ExecutionContext } from '../types';

export async function goToLinkHandler(step: any, context: ExecutionContext) {
  const urlField = step.url_field;
  if (!urlField) throw new Error('url_field is required for GO_TO_LINK');

  let targetUrl = context.extractedData[urlField];
  if (!targetUrl) throw new Error(`URL not found in extractedData for field: ${urlField}`);

  if (typeof targetUrl !== 'string') {
    if (Array.isArray(targetUrl) && targetUrl.length > 0) {
      targetUrl = targetUrl[0];
    } else {
      throw new Error(`Expected string URL in field ${urlField}, got ${typeof targetUrl}`);
    }
  }

  // Normalize relative URL
  if (targetUrl.startsWith('/')) {
    const baseUrl = new URL(context.page.url()).origin;
    targetUrl = `${baseUrl}${targetUrl}`;
  }

  console.log(`[GO_TO_LINK] Navigating to: ${targetUrl}`);
  await context.page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  context.currentUrl = context.page.url();
  context.currentPageTitle = await context.page.title();
  context.stats.pagesVisited++;
}

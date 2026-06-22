import { ExecutionContext } from '../types';

export async function paginationHandler(step: any, context: ExecutionContext) {
  const nextSelector = step.next_selector;
  if (!nextSelector) throw new Error('next_selector is required for PAGINATION');

  const maxPages = step.max_pages || 10;
  const hardMaxPages = 100;
  const limit = Math.min(maxPages, hardMaxPages);
  const stopWhenMissing = step.stop_when_selector_missing ?? true;
  const stepsPerPage = step.steps_per_page || [];

  console.log(`[PAGINATION] Starting pagination loop, max pages: ${limit}`);

  let lastUrl = '';

  for (let pageIndex = 1; pageIndex <= limit; pageIndex++) {
    console.log(`[PAGINATION] Page ${pageIndex}`);
    
    // Execute nested steps for the current page
    if (context.executeSteps && stepsPerPage.length > 0) {
      await context.executeSteps(stepsPerPage, context, { pageIndex });
    }

    // Check next selector
    const hasNext = await context.page.locator(nextSelector).count() > 0;
    if (!hasNext) {
      console.log(`[PAGINATION] Next selector not found. Stopping.`);
      if (stopWhenMissing) break;
    }

    try {
      lastUrl = context.page.url();
      await context.page.click(nextSelector);
      await context.page.waitForLoadState('domcontentloaded');
      // Adding a small implicit wait to allow dynamic frameworks to render
      await context.page.waitForTimeout(2000);

      const currentUrl = context.page.url();
      if (currentUrl === lastUrl && hasNext) {
        // If URL hasn't changed, rely on DOM updates.
        // But if the page genuinely didn't change and we are stuck in a loop, we could break.
        // Since many SPA sites don't change URLs, we assume success if click doesn't throw.
        // Wait, the user asked for an infinite loop guard. "Aynı next page URL'i tekrar oluşursa pagination dursun."
        console.log(`[PAGINATION] URL didn't change (${currentUrl}). Infinite loop guard triggered.`);
        break;
      }

      context.currentUrl = currentUrl;
      context.currentPageTitle = await context.page.title();
      context.stats.pagesVisited++;

    } catch (e: any) {
      console.log(`[PAGINATION] Failed to navigate to next page: ${e.message}`);
      break;
    }
  }
}

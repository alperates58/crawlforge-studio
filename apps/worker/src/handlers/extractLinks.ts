import { ExecutionContext } from '../types';

export async function extractLinksHandler(step: any, context: ExecutionContext) {
  if (!step.selector || !step.field_name) {
    throw new Error('Selector and field_name are required for EXTRACT_LINKS step');
  }

  const elements = context.page.locator(step.selector);
  const count = await elements.count();
  
  const links: string[] = [];
  const limit = step.limit || count;
  
  for (let i = 0; i < Math.min(count, limit); i++) {
    const href = await elements.nth(i).getAttribute('href');
    if (href) {
      // Resolve relative URLs
      const urlObj = new URL(href, context.page.url());
      links.push(urlObj.href);
    }
  }

  context.extractedData[step.field_name] = links;
}

import { ExecutionContext } from '../types';

export async function clickHandler(step: any, context: ExecutionContext) {
  if (!step.selector) {
    throw new Error('Selector is required for CLICK step');
  }
  
  const options: any = {};
  if (step.timeout_ms) {
    options.timeout = step.timeout_ms;
  }
  
  await context.page.click(step.selector, options);
}

import { ExecutionContext } from '../types';

export async function typeHandler(step: any, context: ExecutionContext) {
  if (!step.selector) {
    throw new Error('Selector is required for TYPE step');
  }
  if (!step.value) {
    throw new Error('Value is required for TYPE step');
  }

  if (step.clear_before_type) {
    await context.page.fill(step.selector, '');
  }
  
  await context.page.type(step.selector, step.value);
}

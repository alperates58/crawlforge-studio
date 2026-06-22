import { ExecutionContext } from '../types';

export async function waitHandler(step: any, context: ExecutionContext) {
  const duration = step.duration_ms || 1000;
  await context.page.waitForTimeout(duration);
}

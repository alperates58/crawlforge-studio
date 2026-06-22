import { ExecutionContext } from '../types';

export async function scrollHandler(step: any, context: ExecutionContext) {
  const direction = step.direction === 'up' ? -1 : 1;
  const amount = step.amount || 500;
  
  await context.page.evaluate(({ dir, amt }) => {
    window.scrollBy(0, dir * amt);
  }, { dir: direction, amt: amount });
  
  // Wait a bit for scroll triggered events
  await context.page.waitForTimeout(500);
}

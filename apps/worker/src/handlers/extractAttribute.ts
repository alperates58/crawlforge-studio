import { ExecutionContext } from '../types';

export async function extractAttributeHandler(step: any, context: ExecutionContext) {
  if (!step.selector || !step.field_name) {
    throw new Error('Selector and field_name are required for EXTRACT_ATTRIBUTE step');
  }

  const attributeName = step.attribute || 'src';

  try {
    if (step.extract_all) {
      // Wait for at least one element to be attached
      await context.page.locator(step.selector).first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
      const elements = await context.page.locator(step.selector).all();
      const values: string[] = [];
      for (const el of elements) {
        const val = await el.getAttribute(attributeName, { timeout: 1000 }).catch(() => null);
        values.push(val?.trim() || '');
      }
      if (step.required && values.length === 0) {
        throw new Error(`Required attribute '${attributeName}' for field '${step.field_name}' was not found or empty.`);
      }
      context.extractedData[step.field_name] = values;
    } else {
      const element = context.page.locator(step.selector).first();
      const value = await element.getAttribute(attributeName, { timeout: 5000 });
      if (step.required && !value?.trim()) {
        throw new Error(`Required attribute '${attributeName}' for field '${step.field_name}' was not found or empty.`);
      }
      context.extractedData[step.field_name] = value?.trim() || null;
    }
  } catch (error: any) {
    if (step.required) {
      throw error;
    }
    context.extractedData[step.field_name] = step.extract_all ? [] : null;
  }
}

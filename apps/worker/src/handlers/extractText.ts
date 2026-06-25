import { ExecutionContext } from '../types';

export async function extractTextHandler(step: any, context: ExecutionContext) {
  if (!step.selector || !step.field_name) {
    throw new Error('Selector and field_name are required for EXTRACT_TEXT step');
  }

  try {
    if (step.extract_all) {
      // Wait for at least one element to be attached
      await context.page.locator(step.selector).first().waitFor({ state: 'attached', timeout: 5000 }).catch(() => {});
      const texts = await context.page.locator(step.selector).allTextContents();
      const trimmedTexts = texts.map(t => t.trim());
      
      if (step.required && trimmedTexts.length === 0) {
        throw new Error(`Required text for field '${step.field_name}' was not found or empty.`);
      }
      context.extractedData[step.field_name] = trimmedTexts;
    } else {
      const text = await context.page.locator(step.selector).first().textContent({ timeout: 5000 });
      if (step.required && !text?.trim()) {
        throw new Error(`Required text for field '${step.field_name}' was not found or empty.`);
      }
      context.extractedData[step.field_name] = text?.trim() || null;
    }
  } catch (error: any) {
    if (step.required) {
      throw error;
    }
    context.extractedData[step.field_name] = step.extract_all ? [] : null;
  }
}

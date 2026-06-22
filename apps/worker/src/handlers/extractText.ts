import { ExecutionContext } from '../types';

export async function extractTextHandler(step: any, context: ExecutionContext) {
  if (!step.selector || !step.field_name) {
    throw new Error('Selector and field_name are required for EXTRACT_TEXT step');
  }

  try {
    const text = await context.page.locator(step.selector).first().textContent({ timeout: 5000 });
    
    if (step.required && !text?.trim()) {
      throw new Error(`Required text for field '${step.field_name}' was not found or empty.`);
    }

    context.extractedData[step.field_name] = text?.trim() || null;
  } catch (error: any) {
    if (step.required) {
      throw error;
    }
    // If not required, leave it null
    context.extractedData[step.field_name] = null;
  }
}

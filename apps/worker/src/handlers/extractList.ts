import { ExecutionContext } from '../types';

export async function extractListHandler(step: any, context: ExecutionContext) {
  if (!step.item_selector || !step.fields) {
    throw new Error('item_selector and fields are required for EXTRACT_LIST step');
  }

  // Parse fields if they are sent as a string representation
  let fieldsList = step.fields;
  if (typeof fieldsList === 'string') {
    try {
      fieldsList = JSON.parse(fieldsList);
    } catch (e) {
      throw new Error('fields parameter must be a valid JSON array of field configurations');
    }
  }

  if (!Array.isArray(fieldsList)) {
    throw new Error('fields must be an array of field definitions');
  }

  const items = context.page.locator(step.item_selector);
  const count = await items.count();
  console.log(`[Worker] Found ${count} list items matching selector: ${step.item_selector}`);

  const listItems: any[] = [];
  const limit = step.limit || count;

  for (let i = 0; i < Math.min(count, limit); i++) {
    const itemLocator = items.nth(i);
    const record: any = {};

    for (const field of fieldsList) {
      if (!field.field_name || !field.selector) continue;
      
      try {
        const fieldLocator = itemLocator.locator(field.selector).first();
        const hasElement = await fieldLocator.count() > 0;
        
        if (!hasElement) {
          record[field.field_name] = null;
          continue;
        }

        if (field.type === 'attribute') {
          const attrVal = await fieldLocator.getAttribute(field.attribute || 'src', { timeout: 3000 });
          record[field.field_name] = attrVal ? attrVal.trim() : null;
        } else {
          const textVal = await fieldLocator.textContent({ timeout: 3000 });
          record[field.field_name] = textVal ? textVal.trim() : null;
        }
      } catch (err) {
        console.warn(`[Worker] Failed to extract relative field ${field.field_name} in list item ${i}:`, err);
        record[field.field_name] = null;
      }
    }

    listItems.push(record);

    if (step.save_records) {
      // Save directly as a dataset record
      const dataset = await context.prisma.dataset.create({
        data: {
          projectId: context.projectId,
          botId: context.botId,
          runId: context.runId,
          sourceUrl: context.page.url(),
          dataJson: JSON.stringify(record),
          status: 'draft',
        }
      });

      // Link any document if the field looks like a UUID
      const documentIds: string[] = [];
      for (const val of Object.values(record)) {
        if (typeof val === 'string' && val.length === 36 && val.includes('-')) {
          documentIds.push(val);
        }
      }
      if (documentIds.length > 0) {
        await context.prisma.document.updateMany({
          where: {
            id: { in: documentIds },
            datasetId: null,
          },
          data: {
            datasetId: dataset.id,
          }
        });
      }

      context.stats.recordsExtracted += 1;
    }
  }

  if (!step.save_records) {
    context.extractedData[step.field_name || 'list_items'] = listItems;
  }
}

import { ExecutionContext } from '../types';

export async function saveRecordHandler(step: any, context: ExecutionContext) {
  const data = { ...context.extractedData };
  
  // Helper function to zip arrays of same lengths, propagating scalars
  const zipExtractedData = (raw: Record<string, any>): Record<string, any>[] => {
    const keys = Object.keys(raw);
    const arrayKeys = keys.filter(k => Array.isArray(raw[k]));
    
    if (arrayKeys.length === 0) {
      return [raw];
    }
    
    const maxLength = Math.max(...arrayKeys.map(k => raw[k].length));
    if (maxLength === 0) {
      const record: Record<string, any> = {};
      for (const key of keys) {
        record[key] = Array.isArray(raw[key]) ? null : raw[key];
      }
      return [record];
    }
    
    const records: Record<string, any>[] = [];
    for (let i = 0; i < maxLength; i++) {
      const record: Record<string, any> = {};
      for (const key of keys) {
        if (Array.isArray(raw[key])) {
          record[key] = raw[key][i] !== undefined ? raw[key][i] : null;
        } else {
          record[key] = raw[key];
        }
      }
      records.push(record);
    }
    return records;
  };

  const recordsToSave = zipExtractedData(data);

  for (const recordData of recordsToSave) {
    // Save dataset to DB
    const dataset = await context.prisma.dataset.create({
      data: {
        projectId: context.projectId,
        botId: context.botId,
        runId: context.runId,
        sourceUrl: context.page.url(),
        dataJson: JSON.stringify(recordData),
        status: 'draft',
      }
    });

    // Link documents created in this record
    const documentIds: string[] = [];
    for (const val of Object.values(recordData)) {
      if (typeof val === 'string' && val.length === 36 && val.includes('-')) {
        // Possible UUID, try to see if it's a document
        documentIds.push(val);
      }
    }

    if (documentIds.length > 0) {
      await context.prisma.document.updateMany({
        where: {
          id: { in: documentIds },
          datasetId: null, // Only link if not already linked
        },
        data: {
          datasetId: dataset.id,
        }
      });
    }

    context.stats.recordsExtracted += 1;
  }
  
  // Clear extracted data for the next record in the run
  context.extractedData = {};
}

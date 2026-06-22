import { ExecutionContext } from '../types';

export async function saveRecordHandler(step: any, context: ExecutionContext) {
  const data = { ...context.extractedData };
  
  // Save dataset to DB
  const dataset = await context.prisma.dataset.create({
    data: {
      projectId: context.projectId,
      botId: context.botId,
      runId: context.runId,
      sourceUrl: context.page.url(),
      dataJson: JSON.stringify(data),
      status: 'draft',
    }
  });

  // Link documents created in this record
  const documentIds: string[] = [];
  for (const val of Object.values(data)) {
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
  
  // Clear extracted data for the next record in the run
  context.extractedData = {};
}

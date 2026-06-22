import { ExecutionContext } from '../types';

export async function saveRecordHandler(step: any, context: ExecutionContext) {
  const data = { ...context.extractedData };
  
  // Save dataset to DB
  await context.prisma.dataset.create({
    data: {
      projectId: context.projectId,
      botId: context.botId,
      runId: context.runId,
      sourceUrl: context.page.url(),
      dataJson: JSON.stringify(data),
      status: 'draft',
    }
  });

  context.stats.recordsExtracted += 1;
  
  // Clear extracted data for the next record in the run
  context.extractedData = {};
}

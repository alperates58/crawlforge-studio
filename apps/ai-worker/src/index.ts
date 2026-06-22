import { Worker } from 'bullmq';
import IORedis from 'ioredis';
import { PrismaClient } from '@crawlforge/database';
import { AiProviderService } from './services/AiProviderService';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const prisma = new PrismaClient();
const aiProviderService = new AiProviderService();

const AI_WORKER_CONCURRENCY = parseInt(process.env.AI_WORKER_CONCURRENCY || '2', 10);

console.log('AI Worker starting up. Listening to ai-jobs queue...');

const worker = new Worker('ai-jobs', async (job) => {
  const { aiJobId } = job.data;
  console.log(`Processing AI Job: ${aiJobId}`);

  try {
    // 1. Fetch AI Job
    const aiJob = await prisma.aiJob.findUnique({
      where: { id: aiJobId }
    });

    if (!aiJob) throw new Error('AiJob not found');

    // Update status to running
    await prisma.aiJob.update({
      where: { id: aiJobId },
      data: { status: 'running', startedAt: new Date() }
    });

    // 2. Resolve source text
    let sourceText = '';
    if (aiJob.documentId) {
      const doc = await prisma.document.findUnique({ where: { id: aiJob.documentId } });
      if (doc?.extractedText) sourceText = doc.extractedText;
    } else if (aiJob.datasetId) {
      const ds = await prisma.dataset.findUnique({ where: { id: aiJob.datasetId } });
      if (ds?.dataJson) sourceText = ds.dataJson;
    }

    if (!sourceText) {
      throw new Error('Source text is empty or could not be found.');
    }

    // 3. Fetch Schema and Prompt
    const schema = await prisma.extractionSchema.findUnique({ where: { id: aiJob.schemaId } });
    const promptTemplate = await prisma.promptTemplate.findUnique({ where: { id: aiJob.promptTemplateId } });

    if (!schema || !promptTemplate) {
      throw new Error('Schema or Prompt Template missing');
    }

    // 4. Extract
    const result = await aiProviderService.extractStructuredData(
      sourceText,
      schema.schemaJson,
      promptTemplate.systemPrompt,
      promptTemplate.userPromptTemplate
    );

    // 5. Build ExtractionResult
    const validationErrorStr = result.validationErrors ? JSON.stringify(result.validationErrors) : null;
    const isNeedsReview = result.needsReview || (result.validationErrors && result.validationErrors.length > 0);

    await prisma.$transaction(async (tx) => {
      // Create result
      await tx.extractionResult.create({
        data: {
          aiJobId: aiJobId,
          confidenceScore: result.confidenceScore,
          jsonData: result.json ? JSON.stringify(result.json) : null,
          reviewStatus: isNeedsReview ? 'needs_review' : 'needs_review' // per user: "Hiçbir AI sonucu otomatik approve edilmesin."
        }
      });

      // Update Job
      await tx.aiJob.update({
        where: { id: aiJobId },
        data: {
          status: 'completed',
          finishedAt: new Date(),
          rawResponse: result.rawResponse,
          structuredJson: result.json ? JSON.stringify(result.json) : null,
          validationErrors: validationErrorStr,
          tokenCount: result.tokenCount
        }
      });
    });

    console.log(`Completed AI Job: ${aiJobId}`);

  } catch (error: any) {
    console.error(`AI Job ${aiJobId} failed:`, error.message);
    await prisma.aiJob.update({
      where: { id: aiJobId },
      data: {
        status: 'failed',
        finishedAt: new Date(),
        validationErrors: JSON.stringify([{ message: 'Worker Exception', error: error.message }])
      }
    });
  }
}, { 
  connection: connection as any,
  concurrency: AI_WORKER_CONCURRENCY
});

worker.on('failed', (job, err) => {
  console.error(`Job failed with error ${err.message}`);
});

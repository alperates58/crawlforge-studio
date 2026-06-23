import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import { PrismaClient } from '@crawlforge/database';
import { createWorker } from 'tesseract.js';
import * as fs from 'fs';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const WORKER_CONCURRENCY = parseInt(process.env.WORKER_CONCURRENCY || '2', 10);
const prisma = new PrismaClient();

async function processJob(job: Job) {
  const { documentId } = job.data;
  console.log(`[OCR Worker] Received job for document: ${documentId}`);

  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) {
    throw new Error(`Document ${documentId} not found`);
  }

  if (!fs.existsSync(document.localPath)) {
    throw new Error(`File not found at ${document.localPath}`);
  }

  await prisma.document.update({
    where: { id: documentId },
    data: { ocrStatus: 'running' }
  });

  try {
    const ocrPromise = (async () => {
      const worker = await createWorker('eng+tur');
      const ret = await worker.recognize(document.localPath);
      await worker.terminate();
      return ret.data.text;
    })();

    const timeoutPromise = new Promise<string>((_, reject) => {
      setTimeout(() => reject(new Error('OCR Timeout exceeded (120s)')), 120000);
    });

    const extractedText = await Promise.race([ocrPromise, timeoutPromise]);

    await prisma.document.update({
      where: { id: documentId },
      data: {
        ocrText: extractedText,
        ocrStatus: 'completed'
      }
    });
    console.log(`[OCR Worker] Document ${documentId} OCR completed.`);
  } catch (error: any) {
    console.error(`[OCR Worker] Document ${documentId} failed:`, error);
    
    // Only update ocrStatus to failed, leave main status alone
    await prisma.document.update({
      where: { id: documentId },
      data: {
        ocrStatus: 'failed'
      }
    });
  }
}

const worker = new Worker('ocr-jobs', processJob, { 
  connection: connection as any,
  concurrency: WORKER_CONCURRENCY
});

worker.on('ready', () => {
  console.log('[OCR Worker] Listening for jobs on queue "ocr-jobs"...');
});

worker.on('error', err => {
  console.error('[OCR Worker] Error:', err);
});

process.on('SIGINT', async () => {
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

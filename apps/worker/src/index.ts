import { Worker, Job } from 'bullmq';
import IORedis from 'ioredis';
import dotenv from 'dotenv';
import { runBot } from './runner';
import { PrismaClient } from '@crawlforge/database';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const connection = new IORedis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

const prisma = new PrismaClient();

async function processJob(job: Job) {
  const { runId } = job.data;
  console.log(`[Worker] Received job for run: ${runId}`);
  
  const botRun = await prisma.botRun.findUnique({
    where: { id: runId },
    include: { bot: true },
  });

  if (!botRun) {
    throw new Error(`BotRun ${runId} not found`);
  }

  // Update status to running
  await prisma.botRun.update({
    where: { id: runId },
    data: { 
      status: 'running',
      startedAt: new Date()
    }
  });

  try {
    const result = await runBot(botRun, prisma);
    
    // Update status to succeeded
    await prisma.botRun.update({
      where: { id: runId },
      data: {
        status: 'succeeded',
        finishedAt: new Date(),
        durationMs: new Date().getTime() - botRun.startedAt!.getTime(),
        pagesVisited: result.pagesVisited,
        recordsExtracted: result.recordsExtracted,
      }
    });
    console.log(`[Worker] Run ${runId} succeeded.`);
    
  } catch (error: any) {
    console.error(`[Worker] Run ${runId} failed:`, error);
    
    // Update status to failed
    await prisma.botRun.update({
      where: { id: runId },
      data: {
        status: 'failed',
        finishedAt: new Date(),
        durationMs: botRun.startedAt ? new Date().getTime() - botRun.startedAt.getTime() : null,
        errorMessage: error.message || 'Unknown error occurred',
      }
    });
  }
}

const worker = new Worker('bot-runs', processJob, { connection: connection as any });

worker.on('ready', () => {
  console.log('[Worker] Listening for jobs on queue "bot-runs"...');
});

worker.on('error', err => {
  console.error('[Worker] Error:', err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await worker.close();
  await prisma.$disconnect();
  process.exit(0);
});

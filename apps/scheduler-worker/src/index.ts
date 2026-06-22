import { PrismaClient } from '@crawlforge/database';
import IORedis from 'ioredis';
import { Queue } from 'bullmq';
import cronParser from 'cron-parser';
import dotenv from 'dotenv';
import os from 'os';
import fs from 'fs';
import path from 'path';

dotenv.config();

const prisma = new PrismaClient();
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const connection = new IORedis(REDIS_URL, { maxRetriesPerRequest: null });
const botRunsQueue = new Queue('bot-runs', { connection: connection as any });

const SCHEDULER_INTERVAL_SECONDS = parseInt(process.env.SCHEDULER_INTERVAL_SECONDS || '30', 10);
const LOCK_KEY = 'scheduler:lock';
const LOCK_TTL_MS = Math.max(SCHEDULER_INTERVAL_SECONDS * 1000 - 1000, 5000); // slightly less than interval

async function processSchedules() {
  // Try to acquire distributed lock
  const locked = await connection.set(LOCK_KEY, 'locked', 'PX', LOCK_TTL_MS, 'NX');
  if (!locked) {
    console.log('[Scheduler] Another instance is currently processing schedules. Skipping.');
    return;
  }

  try {
    const now = new Date();
    const dueSchedules = await prisma.botSchedule.findMany({
      where: {
        isActive: true,
        nextRunAt: { lte: now }
      },
      include: {
        bot: {
          include: {
            botRuns: {
              where: { status: { in: ['queued', 'running'] } },
              take: 1
            }
          }
        }
      }
    });

    if (dueSchedules.length > 0) {
      console.log(`[Scheduler] Found ${dueSchedules.length} due schedules.`);
    }

    for (const schedule of dueSchedules) {
      // 1. If bot has queued or running run, skip
      if (schedule.bot.botRuns.length > 0) {
        console.log(`[Scheduler] Bot ${schedule.botId} already has a queued/running run. Skipping schedule ${schedule.id}.`);
        continue;
      }

      // 2. Create Run (Single run)
      const run = await prisma.botRun.create({
        data: {
          botId: schedule.botId,
          status: 'queued',
          triggerReason: 'schedule',
        }
      });

      await botRunsQueue.add('run-bot', { runId: run.id });
      console.log(`[Scheduler] Created schedule run ${run.id} for bot ${schedule.botId}`);

      // 3. Calculate nextRunAt
      let nextRunAt = null;
      if (schedule.cronExpression) {
        try {
          const interval = cronParser.parseExpression(schedule.cronExpression, {
            tz: schedule.timezone || 'Europe/Istanbul',
            currentDate: now // Start calculation from now to avoid catching up past runs
          });
          nextRunAt = interval.next().toDate();
        } catch (err: any) {
          console.error(`[Scheduler] Failed to parse cron for schedule ${schedule.id}: ${err.message}`);
        }
      }

      // 4. Update schedule
      await prisma.botSchedule.update({
        where: { id: schedule.id },
        data: {
          lastRunAt: now,
          nextRunAt
        }
      });
    }

  } catch (err: any) {
    console.error(`[Scheduler] Error processing schedules: ${err.message}`);
  }
}

async function collectMetrics() {
  try {
    const queueSize = await botRunsQueue.count();
    // Getting active bullmq workers would require querying bullmq internals, we use a placeholder or approximate.
    const activeWorkers = await botRunsQueue.getWorkers().then(w => w.length).catch(() => 0);

    const cpuUsage = os.loadavg()[0]; // 1 minute load avg
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const memoryUsage = ((totalMem - freeMem) / totalMem) * 100;

    await prisma.systemMetric.create({
      data: {
        cpuUsage,
        memoryUsage,
        queueSize,
        activeWorkers
      }
    });
    console.log(`[Scheduler] Collected metrics: CPU ${cpuUsage.toFixed(2)}, Mem ${memoryUsage.toFixed(2)}%, Queue ${queueSize}`);
  } catch (err: any) {
    console.error(`[Scheduler] Failed to collect metrics: ${err.message}`);
  }
}

async function runCleanup() {
  try {
    console.log('[Scheduler] Running daily cleanup...');
    const now = new Date();
    
    // 1. Delete BotStepLog older than 90 days
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
    const deletedLogs = await prisma.botStepLog.deleteMany({
      where: { createdAt: { lt: ninetyDaysAgo } }
    });
    console.log(`[Scheduler] Cleaned up ${deletedLogs.count} old BotStepLogs.`);

    // 2. Temp files older than 30 days
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const tmpPath = '/app/storage/tmp';
    if (fs.existsSync(tmpPath)) {
      const files = fs.readdirSync(tmpPath);
      let deletedTmpCount = 0;
      for (const file of files) {
        const filePath = path.join(tmpPath, file);
        const stats = fs.statSync(filePath);
        if (stats.mtime < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          deletedTmpCount++;
        }
      }
      console.log(`[Scheduler] Cleaned up ${deletedTmpCount} old temp files.`);
    }

    // Note: Screenshots can be cleaned similarly if stored in a predictable path.
    // Assuming /app/storage/screenshots
    const screenshotsPath = '/app/storage/screenshots';
    if (fs.existsSync(screenshotsPath)) {
      const files = fs.readdirSync(screenshotsPath);
      let deletedScreenshots = 0;
      for (const file of files) {
        const filePath = path.join(screenshotsPath, file);
        const stats = fs.statSync(filePath);
        if (stats.mtime < thirtyDaysAgo) {
          fs.unlinkSync(filePath);
          deletedScreenshots++;
        }
      }
      console.log(`[Scheduler] Cleaned up ${deletedScreenshots} old screenshots.`);
    }
  } catch (err: any) {
    console.error(`[Scheduler] Failed to run cleanup: ${err.message}`);
  }
}

async function start() {
  console.log(`[Scheduler] Starting worker. Interval: ${SCHEDULER_INTERVAL_SECONDS}s`);
  
  // Initial check
  await processSchedules();
  await collectMetrics();

  setInterval(processSchedules, SCHEDULER_INTERVAL_SECONDS * 1000);
  setInterval(collectMetrics, 5 * 60 * 1000); // 5 minutes
  setInterval(runCleanup, 24 * 60 * 60 * 1000); // 24 hours
}

start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  connection.disconnect();
  process.exit(0);
});

import { PrismaClient } from '@crawlforge/database';
import IORedis from 'ioredis';
import { Queue } from 'bullmq';
import cronParser from 'cron-parser';
import dotenv from 'dotenv';

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

async function start() {
  console.log(`[Scheduler] Starting worker. Interval: ${SCHEDULER_INTERVAL_SECONDS}s`);
  
  // Initial check
  await processSchedules();

  setInterval(processSchedules, SCHEDULER_INTERVAL_SECONDS * 1000);
}

start().catch(console.error);

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  connection.disconnect();
  process.exit(0);
});

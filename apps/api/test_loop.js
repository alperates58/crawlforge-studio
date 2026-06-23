const { PrismaClient } = require("@crawlforge/database");
const { Queue } = require("bullmq");

async function run() {
  const prisma = new PrismaClient();
  const loopBot = await prisma.bot.findFirst({ where: { name: "Loop Test Bot" } });
  if (!loopBot) {
    console.error("Loop bot not found!");
    process.exit(1);
  }
  
  const botRun = await prisma.botRun.create({
    data: {
      botId: loopBot.id,
      status: "queued"
    }
  });
  console.log("Created Run ID: " + botRun.id);
  
  const queue = new Queue("bot-runs", { connection: { host: "redis", port: 6379 } });
  await queue.add("run", { runId: botRun.id });
  console.log("Job added to queue.");
}
run().catch(console.error);

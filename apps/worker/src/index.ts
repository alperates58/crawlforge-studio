import { PrismaClient } from '@crawlforge/database';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  console.log('Worker skeleton started.');
  
  // Dummy loop to keep the process alive
  setInterval(() => {
    console.log('Worker is alive, waiting for future implementation...');
  }, 60000);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

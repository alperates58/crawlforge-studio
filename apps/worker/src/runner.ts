import { chromium } from 'playwright';
import { PrismaClient } from '@crawlforge/database';
import { ExecutionContext } from './types';
import { openUrlHandler } from './handlers/openUrl';
import { clickHandler } from './handlers/click';
import { typeHandler } from './handlers/type';
import { waitHandler } from './handlers/wait';
import { scrollHandler } from './handlers/scroll';
import { extractTextHandler } from './handlers/extractText';
import { extractLinksHandler } from './handlers/extractLinks';
import { saveRecordHandler } from './handlers/saveRecord';
import { downloadFileHandler } from './handlers/downloadFile';
import { goToLinkHandler } from './handlers/goToLink';
import { paginationHandler } from './handlers/pagination';
import { loopLinksHandler } from './handlers/loopLinks';
import { extractAttributeHandler } from './handlers/extractAttribute';
import { extractListHandler } from './handlers/extractList';

export async function runBot(botRun: any, prisma: PrismaClient) {
  const browser = await chromium.launch({ headless: true });
  const browserContext = await browser.newContext();
  const page = await browserContext.newPage();
  
  const context: ExecutionContext = {
    page,
    prisma,
    runId: botRun.id,
    botId: botRun.botId,
    projectId: botRun.bot.projectId,
    currentUrl: '',
    currentPageTitle: '',
    variables: {},
    extractedData: {},
    links: [],
    stats: {
      pagesVisited: 0,
      recordsExtracted: 0,
    }
  };

  context.executeSteps = async (steps: any[], ctx: ExecutionContext, indices?: { pageIndex?: number, itemIndex?: number, parentStepIndex?: number }) => {
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      console.log(`[Worker] Executing step ${i}: ${step.type}`);
      
      try {
        await executeStep(step, ctx);
        
        // Log success
        await ctx.prisma.botStepLog.create({
          data: {
            runId: ctx.runId,
            stepIndex: i,
            stepType: step.type,
            status: 'succeeded',
            pageIndex: indices?.pageIndex,
            itemIndex: indices?.itemIndex,
            parentStepIndex: indices?.parentStepIndex,
          }
        });
        
      } catch (err: any) {
        // Log failure
        await ctx.prisma.botStepLog.create({
          data: {
            runId: ctx.runId,
            stepIndex: i,
            stepType: step.type,
            status: 'failed',
            message: err.message || 'Unknown error in step execution',
            pageIndex: indices?.pageIndex,
            itemIndex: indices?.itemIndex,
            parentStepIndex: indices?.parentStepIndex,
          }
        });
        
        throw new Error(`Step ${i} (${step.type}) failed: ${err.message}`);
      }
    }
  };

  try {
    const steps = botRun.bot.stepsJson ? JSON.parse(botRun.bot.stepsJson) : [];
    await context.executeSteps(steps, context);
    
    // Auto-save fallback if the user extracted data but forgot to add a SAVE_RECORD step
    if (Object.keys(context.extractedData).length > 0) {
      console.log('[Worker] Auto-saving remaining extracted data at the end of the run');
      await saveRecordHandler({ type: 'SAVE_RECORD' }, context);
    }
    
    return context.stats;
  } finally {
    await browser.close();
  }
}

async function executeStep(step: any, context: ExecutionContext) {
  switch (step.type) {
    case 'OPEN_URL':
      await openUrlHandler(step, context);
      break;
    case 'CLICK':
      await clickHandler(step, context);
      break;
    case 'TYPE':
      await typeHandler(step, context);
      break;
    case 'WAIT':
      await waitHandler(step, context);
      break;
    case 'SCROLL':
      await scrollHandler(step, context);
      break;
    case 'EXTRACT_TEXT':
      await extractTextHandler(step, context);
      break;
    case 'EXTRACT_LINKS':
      await extractLinksHandler(step, context);
      break;
    case 'EXTRACT_ATTRIBUTE':
      await extractAttributeHandler(step, context);
      break;
    case 'EXTRACT_LIST':
      await extractListHandler(step, context);
      break;
    case 'SAVE_RECORD':
      await saveRecordHandler(step, context);
      break;
    case 'DOWNLOAD_FILE':
      await downloadFileHandler(step, context);
      break;
    case 'GO_TO_LINK':
      await goToLinkHandler(step, context);
      break;
    case 'PAGINATION':
      await paginationHandler(step, context);
      break;
    case 'LOOP_LINKS':
      await loopLinksHandler(step, context);
      break;
    case 'SAVE_RECORD':
      await saveRecordHandler(step, context);
      break;
    case 'DOWNLOAD_FILE':
      await downloadFileHandler(step, context);
      break;
    default:
      throw new Error(`Unsupported step type: ${step.type}`);
  }
}

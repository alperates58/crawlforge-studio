import { Page } from 'playwright';
import { PrismaClient } from '@crawlforge/database';

export interface ExecutionContext {
  page: Page;
  prisma: PrismaClient;
  runId: string;
  botId: string;
  projectId?: string | null;
  currentUrl: string;
  currentPageTitle: string;
  variables: Record<string, any>;
  extractedData: Record<string, any>;
  links: string[];
  stats: {
    pagesVisited: number;
    recordsExtracted: number;
  };
  executeSteps?: (steps: any[], context: ExecutionContext, indices?: { pageIndex?: number, itemIndex?: number, parentStepIndex?: number }) => Promise<void>;
}

export type StepHandler = (step: any, context: ExecutionContext) => Promise<void>;

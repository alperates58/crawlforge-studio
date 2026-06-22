export type DatasetStatus = 'draft' | 'needs_review' | 'approved' | 'rejected';

export interface Dataset {
  id: string;
  projectId: string | null;
  botId: string | null;
  runId: string | null;
  sourceUrl: string | null;
  dataJson: string | null;
  status: DatasetStatus;
  confidenceScore: number | null;
  createdAt: string;
  updatedAt: string;
  project?: { name: string };
  bot?: { name: string };
}

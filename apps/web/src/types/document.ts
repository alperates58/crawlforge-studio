export type DocumentStatus = 'pending' | 'ready' | 'failed';

export interface DocumentType {
  id: string;
  projectId?: string;
  project?: { name: string };
  datasetId?: string;
  dataset?: { id: string };
  sourceUrl?: string;
  originalUrl?: string;
  filename: string;
  originalFilename?: string;
  mimeType?: string;
  sizeBytes?: number;
  // localPath is hidden by API
  downloadUrl?: string;
  extractedText?: string;
  aiExtractedJson?: string;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

export type DocumentStatus = 'pending' | 'ready' | 'failed';
export type OcrStatus = 'pending' | 'running' | 'completed' | 'failed';

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
  ocrText?: string;
  ocrStatus?: OcrStatus;
  status: DocumentStatus;
  createdAt: string;
  updatedAt: string;
}

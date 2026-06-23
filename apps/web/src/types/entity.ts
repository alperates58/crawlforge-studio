import { Dataset } from './dataset';
import { DocumentType } from './document';

export interface Entity {
  id: string;
  entityType: string;
  entityName: string;
  normalizedName: string;
  metadataJson: string | null;
  createdAt: string;
  updatedAt: string;
  
  _count?: {
    sources: number;
    sourceRelations: number;
    targetRelations: number;
  };

  sources?: EntitySource[];
  sourceRelations?: Relation[];
  targetRelations?: Relation[];
}

export interface Relation {
  id: string;
  sourceEntityId: string;
  targetEntityId: string;
  relationType: string;
  confidenceScore: number | null;
  createdAt: string;

  sourceEntity?: Entity;
  targetEntity?: Entity;
}

export interface EntitySource {
  id: string;
  entityId: string;
  datasetId: string | null;
  documentId: string | null;
  aiJobId: string | null;
  createdAt: string;

  dataset?: Dataset;
  document?: DocumentType;
  aiJob?: any; // Add specific ai job type if necessary
}

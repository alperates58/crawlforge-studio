export type StepType = 
  | 'OPEN_URL'
  | 'CLICK'
  | 'TYPE'
  | 'WAIT'
  | 'SCROLL'
  | 'EXTRACT_TEXT'
  | 'EXTRACT_LINKS'
  | 'EXTRACT_ATTRIBUTE'
  | 'EXTRACT_LIST'
  | 'SAVE_RECORD'
  | 'DOWNLOAD_FILE'
  | 'LOOP_LINKS'
  | 'PAGINATION'
  | 'GO_TO_LINK';

export interface BaseStep {
  id: string; // Unique ID for drag and drop / React keys
  type: StepType;
}

export interface OpenUrlStep extends BaseStep {
  type: 'OPEN_URL';
  url: string;
}

export interface ClickStep extends BaseStep {
  type: 'CLICK';
  selector: string;
  timeout_ms?: number;
}

export interface TypeStep extends BaseStep {
  type: 'TYPE';
  selector: string;
  value: string;
  clear_before_type?: boolean;
}

export interface WaitStep extends BaseStep {
  type: 'WAIT';
  duration_ms: number;
}

export interface ScrollStep extends BaseStep {
  type: 'SCROLL';
  direction: 'up' | 'down';
  amount?: number;
}

export interface ExtractTextStep extends BaseStep {
  type: 'EXTRACT_TEXT';
  field_name: string;
  selector: string;
  required?: boolean;
}

export interface ExtractLinksStep extends BaseStep {
  type: 'EXTRACT_LINKS';
  field_name: string;
  selector: string;
  limit?: number;
}

export interface ExtractAttributeStep extends BaseStep {
  type: 'EXTRACT_ATTRIBUTE';
  field_name: string;
  selector: string;
  attribute: string;
  required?: boolean;
}

export interface ExtractListField {
  field_name: string;
  selector: string;
  type: 'text' | 'attribute';
  attribute?: string;
}

export interface ExtractListStep extends BaseStep {
  type: 'EXTRACT_LIST';
  field_name?: string;
  item_selector: string;
  fields: ExtractListField[];
  save_records: boolean;
  limit?: number;
}

export interface SaveRecordStep extends BaseStep {
  type: 'SAVE_RECORD';
  status?: string; // Optional status marker
}

export interface DownloadFileStep extends BaseStep {
  type: 'DOWNLOAD_FILE';
  selector: string;
  field_name: string;
  allowed_extensions?: string;
  required?: boolean;
  timeout_ms?: number;
}

export interface LoopLinksStep extends BaseStep {
  type: 'LOOP_LINKS';
  source_field: string;
  max_items?: number;
  steps: BotStep[];
}

export interface PaginationStep extends BaseStep {
  type: 'PAGINATION';
  next_selector: string;
  max_pages?: number;
  stop_when_selector_missing?: boolean;
  steps_per_page: BotStep[];
}

export interface GoToLinkStep extends BaseStep {
  type: 'GO_TO_LINK';
  url_field: string;
}

export type BotStep = 
  | OpenUrlStep
  | ClickStep
  | TypeStep
  | WaitStep
  | ScrollStep
  | ExtractTextStep
  | ExtractLinksStep
  | ExtractAttributeStep
  | ExtractListStep
  | SaveRecordStep
  | DownloadFileStep
  | LoopLinksStep
  | PaginationStep
  | GoToLinkStep;

export interface AiSettingType {
  id?: string;
  providerName: string;
  baseUrl: string;
  apiKey?: string; // used for saving
  apiKeyMasked?: string; // from api
  model: string;
  temperature: number;
}

export interface ExtractionSchemaType {
  id: string;
  name: string;
  description?: string;
  schemaJson: string;
  createdAt: string;
}

export interface PromptTemplateType {
  id: string;
  name: string;
  systemPrompt: string;
  userPromptTemplate: string;
  createdAt: string;
}

import { PrismaClient } from '@crawlforge/database';
import { decrypt } from '../utils/encryption';
import axios from 'axios';
import Ajv from 'ajv';

const prisma = new PrismaClient();
const ajv = new Ajv({ allErrors: true });

export interface AiExtractionResult {
  json: any;
  confidenceScore: number;
  tokenCount: number;
  needsReview: boolean;
  rawResponse?: string;
  validationErrors?: any;
}

export class AiProviderService {
  async extractStructuredData(
    text: string,
    schemaJson: string,
    systemPromptTemplate: string,
    userPromptTemplate: string
  ): Promise<AiExtractionResult> {
    // 1. Check ENCRYPTION_KEY safely first
    if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 32) {
      throw new Error('FATAL: ENCRYPTION_KEY is missing or invalid length.');
    }

    // 2. Load active AI Setting
    const setting = await prisma.aiSetting.findFirst({
      where: { isActive: true }
    });

    if (!setting) {
      throw new Error('No active AI Provider configured.');
    }

    const apiKey = decrypt(setting.encryptedApiKey);

    // 3. Prepare schema
    let schemaObj;
    try {
      schemaObj = JSON.parse(schemaJson);
    } catch (e) {
      throw new Error('Invalid JSON Schema provided.');
    }

    // 4. Construct messages
    // The prompt needs to guide the model to output JSON that matches the schema.
    const finalSystemPrompt = `${systemPromptTemplate}\n\nYou must output ONLY valid JSON that matches this schema:\n${schemaJson}`;
    const finalUserPrompt = userPromptTemplate.replace('{{text}}', text);

    const payload = {
      model: setting.model,
      temperature: setting.temperature,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: finalSystemPrompt },
        { role: 'user', content: finalUserPrompt }
      ]
    };

    // 5. Call OpenAI-compatible endpoint
    let rawResponse = '';
    let tokenCount = 0;
    try {
      const response = await axios.post(`${setting.baseUrl}/chat/completions`, payload, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      rawResponse = response.data.choices[0].message.content;
      tokenCount = response.data.usage?.total_tokens || 0;
    } catch (error: any) {
      console.error('AI Request Error:', error?.response?.data || error.message);
      throw new Error('AI Provider request failed: ' + (error?.response?.data?.error?.message || error.message));
    }

    // 6. Parse and Validate
    let jsonResult = null;
    let needsReview = false;
    let validationErrors = null;
    let confidenceScore = 1.0;

    try {
      jsonResult = JSON.parse(rawResponse);
      
      const validate = ajv.compile(schemaObj);
      const valid = validate(jsonResult);
      if (!valid) {
        needsReview = true;
        validationErrors = validate.errors;
        confidenceScore = 0.5; // downgrade score on validation fail
      } else {
        // Evaluate fields for missing data simply
        let filledFields = 0;
        let totalFields = 0;
        for (const k in jsonResult) {
          totalFields++;
          if (jsonResult[k] !== null && jsonResult[k] !== '' && jsonResult[k] !== undefined) {
            filledFields++;
          }
        }
        if (totalFields > 0) {
          confidenceScore = filledFields / totalFields;
        }
      }
    } catch (parseError) {
      needsReview = true;
      validationErrors = [{ message: 'Failed to parse JSON', error: parseError }];
      confidenceScore = 0.0;
    }

    return {
      json: jsonResult,
      confidenceScore,
      tokenCount,
      needsReview,
      rawResponse,
      validationErrors
    };
  }
}

# Phase 06A: AI Foundation

## Goal
Establish a robust AI Foundation layer capable of dynamically routing structured extraction requests to OpenAI-compatible endpoints (DeepSeek, OpenAI, Local Models) using pre-defined JSON schemas and prompt templates.

## Details
1. **AI Settings UI**: Configures provider base URLs, encrypted API keys, and models. Uses AES-256-CBC for secret protection.
2. **Database Models**: Added `AiSetting`, `ExtractionSchema`, `PromptTemplate`.
3. **AI Provider Service**: Backend utility wrapper combining system prompts with user text, performing dynamic HTTP requests, and strict JSON schema validation via `ajv`.
4. **AI Playground**: An interactive UI for testing raw text extractions against defined schemas immediately.

## Status
Completed.

## Not Included in this Phase
- Autonomous Worker execution of AI steps
- Automatic Approval queues
- File OCR (Optical Character Recognition)
- Task scheduling

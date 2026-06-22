# Phase 06B: AI Jobs and Review

## Goal
Decouple AI processing from general web scraping worker, introducing asynchronous processing for AI extractions and a manual review system.

## Details
1. **AI Worker**: Introduced a new scalable service `ai-worker` listening to the `ai-jobs` BullMQ queue. This service reads scraped data, talks to AI APIs via `AiProviderService`, and records results.
2. **Database Schema**: 
   - `AiJob` tracks the state (`pending`, `running`, `completed`, `failed`) and the metadata (token count, raw response).
   - `ExtractionResult` records the JSON data with a mandatory manual review state (`needs_review`, `approved`, `rejected`). Auto-approval is intentionally disabled.
3. **API Endpoints**: 
   - `GET /api/ai-jobs` and `GET /api/ai-jobs/:id`
   - `POST /api/ai-jobs` (Creates a pending job)
   - `POST /api/ai-jobs/:id/run` (Queues job into BullMQ)
   - `POST /api/ai-jobs/:id/approve` and `POST /api/ai-jobs/:id/reject`
4. **Frontend UI**:
   - **AI Jobs**: Grid view showing all jobs and their sources.
   - **AI Job Detail**: Tabbed interface to review Overview, Raw Response, JSON, and Validation errors, with action buttons to Approve or Reject the extraction.

## Status
Completed.

## Not Included in this Phase
- Scheduler logic
- OCR support for PDFs/images
- Browser action recorder
- Knowledge Graph integration

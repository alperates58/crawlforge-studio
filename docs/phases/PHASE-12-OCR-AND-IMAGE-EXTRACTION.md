# PHASE 12: OCR AND IMAGE EXTRACTION

## Overview
This phase adds support for extracting text from image formats (PNG, JPG, JPEG, WEBP, TIF, TIFF) and PDF scans using Tesseract.js. It introduces a dedicated `ocr-worker` microservice to offload OCR workloads via BullMQ.

## Features Implemented
- **Prisma Updates:** Added `OcrStatus` enum and `ocrText`, `ocrStatus` fields to the `Document` model.
- **Worker Enhancements:** The bot `worker` detects image MIME types and triggers an `OCR_JOB` upon download.
- **OCR Worker (`apps/ocr-worker`):** A new container running Tesseract.js, processing jobs from the `ocr-jobs` queue with a 120-second timeout.
- **AI Integration:** The AI Pipeline fallback mechanism prefers `extractedText`, but falls back to `ocrText` if available.
- **API Endpoints:** Created a `/api/documents/:id/retry-ocr` endpoint.
- **UI Enhancements:**
  - Added an OCR status badge to the `Document` list view.
  - Added a dedicated "OCR Text" tab inside the `DocumentDetail` view to show the raw extracted text in a read-only textarea.
  - Added a "Retry OCR" button in the `DocumentDetail` view.

## Notes
- `docker-compose.yml` updated with `ocr-worker`.
- Tesseract currently extracts English and Turkish text (`eng+tur`).
- A failure in OCR execution only marks `ocrStatus` as `failed` to prevent the whole document status from failing.

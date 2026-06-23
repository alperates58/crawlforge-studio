# CrawlForge Status

## Current Phase

```txt
PHASE-12-OCR-AND-IMAGE-EXTRACTION
```

## Current Version

```txt
0.12.0
```

## Project State

Worker engine is built. BullMQ and Redis handle job queuing. Playwright worker executes bot steps seamlessly. Runs UI enables manual invocation and displays run results and step logs. Scheduler worker enables timezone-aware cron-based automated execution of bots. Production hardening is complete (rate limits, retries, cleanup, metrics, health). Browser Recorder provides CDP Screencast-based remote browsing and click/type step recording inside the web UI. Stabilization for production deployment is completed. OCR Worker enables extracting text from image documents.

## Completed

- [x] Product idea defined
- [x] Project name selected: CrawlForge
- [x] Domain target selected: databot.alperates.com.tr
- [x] Initial README created
- [x] Product spec created
- [x] Database design created
- [x] Coolify deployment notes created
- [x] Legal/ethical guidelines created
- [x] Phase 01: Monorepo setup
- [x] Phase 01: Docker Compose compatibility
- [x] Phase 01: Prisma & PostgreSQL setup
- [x] Phase 01: JWT Auth & API
- [x] Phase 01: Web UI (Dashboard, Projects, Bots)

## Completed Phases

- [x] Phase 01: Project setup and monorepo configuration (Turborepo, Next.js, Express, Prisma)
- [x] Phase 02: Bot Builder core UI and Bot Model creation
- [x] Phase 03: Worker Engine (Playwright integration, BullMQ queues, execution context)
- [x] Phase 04: Datasets listing page with filters, search, and pagination
- [x] Phase 04: Dataset Detail page with raw JSON editing
- [x] Phase 04: CSV streaming export with dynamic columns
- [x] Phase 05: DOWNLOAD_FILE step in worker with pdf-parse and UUIDs
- [x] Phase 05: Document entity creation and Dataset linking
- [x] Phase 05: /storage local storage volume exposure
- [x] Phase 05: Document Center UI (pagination, search, filter)
- [x] Phase 05: Document Detail UI with Metadata and Extracted Text tabs
- [x] Phase 06A: AI Foundation (AI Settings, Schemas, Prompts, Playground)
- [x] Phase 06B: AI Jobs and Review (ai-worker, Manual Review, UI integration)
- [x] Phase 07: Loop Links and Pagination (Deep scraping logic, Isolated Tabs, DB Logging)
- [x] Phase 08: Scheduler (Timezone-aware cron scheduling, standalone worker, UI management)
- [x] Phase 09: Production Hardening (Rate limits, Retries, Concurrency, System Metrics, Cleanup Jobs)
- [x] Phase 10: Browser Recorder (CDP Screencast, Interactive Visual Recording, Intelligent Selectors)

- [x] Phase 11: Stabilization (Frontend API Base URL routing for production)
- [x] Phase 12: OCR and Image Extraction (Tesseract.js worker, UI badges and retry mechanisms)

## In Progress

- [ ] Next features

## Next Phase

```txt
PHASE-13-KNOWLEDGE-GRAPH
```

## Phase 01 Goal

Build the application foundation only:

- Login
- Dashboard
- Project CRUD
- Bot CRUD
- PostgreSQL
- Prisma
- Docker Compose compatibility

## Do Not Start Yet

- Playwright worker
- AI extraction
- PDF parser
- Scheduler
- Marketplace
- Proxy/captcha logic

## Last Updated

2026-06-22

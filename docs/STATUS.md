# CrawlForge Status

## Current Phase

```txt
PHASE-04-DATASETS
```

## Current Version

```txt
0.0.1
```

## Project State

Worker engine is built. BullMQ and Redis handle job queuing. Playwright worker executes bot steps seamlessly. Runs UI enables manual invocation and displays run results and step logs.

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
- [x] Phase 02: Bot Builder UI
- [x] Phase 02: Visual Step editor with form fields
- [x] Phase 02: Read-only JSON preview
- [x] Phase 02: API support for saving steps_json
- [x] Phase 03: Redis + BullMQ integration
- [x] Phase 03: Playwright Worker Engine
- [x] Phase 03: Step Handlers (Open URL, Click, Type, Wait, Scroll, Extract, Save)
- [x] Phase 03: Manual Bot Run execution and reporting
- [x] Phase 03: Run detail UI with step logs
- [x] Phase 04: Database schema relations for Datasets
- [x] Phase 04: API endpoints (list, detail, update, approve/reject, csv export)
- [x] Phase 04: Datasets listing page with filters, search, and pagination
- [x] Phase 04: Dataset Detail page with raw JSON editing
- [x] Phase 04: CSV streaming export with dynamic columns

## In Progress

- [ ] Moving to Phase 05

## Next Phase

```txt
PHASE-05-DOCUMENT-CENTER
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

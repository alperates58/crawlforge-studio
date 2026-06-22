# MVP Roadmap

## Phase 0 — Repository Setup

- Monorepo yapısı
- Docker Compose
- .env.example
- README
- Healthcheck endpoint
- PostgreSQL bağlantısı
- Redis bağlantısı

## Phase 1 — Core App

- Login
- Dashboard
- Project CRUD
- Bot CRUD
- Settings

## Phase 2 — Bot Builder

- Step list UI
- Step add/edit/delete
- OPEN_URL
- CLICK
- TYPE
- WAIT
- SCROLL
- EXTRACT_TEXT
- EXTRACT_LINKS
- SAVE_RECORD

## Phase 3 — Worker

- BullMQ queue
- Playwright worker
- Bot run
- Step logs
- Error handling
- Dataset save

## Phase 4 — Dataset

- Dataset table
- Search/filter
- Detail view
- Approve/reject
- CSV export

## Phase 5 — Documents

- PDF download
- File metadata
- Text extraction
- Document center

## Phase 6 — AI Extract

- OpenAI-compatible API settings
- Schema based extraction
- JSON output validation
- Confidence score
- needs_review flow

## Phase 7 — Production Hardening

- Rate limit
- Retry policy
- Worker concurrency settings
- Log cleanup
- Backup notes
- Coolify production deploy

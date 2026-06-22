# Phase 09: Production Hardening

## Goal
Prepare CrawlForge for a stable production environment by introducing basic monitoring, rate limits, retry policies, system stats tracking, and cleanup mechanisms.

## Tasks Completed
- [x] Create `SystemMetric` table in the database to sample CPU, memory, active workers, and queue size.
- [x] Integrate `express-rate-limit` for API routes (100 req/min).
- [x] Add global `X-CrawlForge-Version` API header using `APP_VERSION`.
- [x] Implement API Health Endpoints (`/api/health`, `/api/health/worker`, `/api/health/ai-worker`, `/api/health/scheduler`).
- [x] Apply standard BullMQ retry policy for `botRunsQueue` and `aiJobsQueue` (3 attempts, 30s exponential backoff).
- [x] Make worker concurrency configurable via `WORKER_CONCURRENCY` and `AI_WORKER_CONCURRENCY`.
- [x] Introduce an automated cleanup job inside `scheduler-worker` (Deletes `BotStepLog` older than 90 days and temp files/screenshots older than 30 days).
- [x] Add System Settings screen in the Frontend UI to monitor dataset size, database status, and other aggregated metrics.

## Key Technical Decisions
- **Metrics Collection:** Runs every 5 minutes inside `scheduler-worker`. Simple OS stats and BullMQ queue sizes are recorded to `SystemMetric`.
- **Cleanup Strategy:** Placed daily logic within `scheduler-worker` for simplicity rather than provisioning a separate container. Uses filesystem stat (`mtime`) for local file cleanup.
- **Rate Limit Scope:** Health check endpoints were omitted from rate limits so uptime monitors are not erroneously blocked.
- **Concurrency Handling:** Allows Coolify or system admins to tweak concurrency counts seamlessly without rebuilding images.

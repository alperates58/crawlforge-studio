# Phase 08: Scheduler

## Goal
Enable bots to run automatically on a defined schedule (e.g., hourly, daily, weekly, custom cron).

## Tasks Completed

- [x] Create `bot_schedules` logic in database
- [x] Add `triggerReason` to `bot_runs`
- [x] Expose GET/PUT schedule API endpoints in backend
- [x] Expose global GET /api/schedules and Pause/Resume endpoints
- [x] Create `apps/scheduler-worker` container
- [x] Implement polling schedule loop with `cron-parser` and `ioredis` lock
- [x] UI: Add "Schedule" tab to Bot Builder
- [x] UI: Add Global "Schedules" page in sidebar
- [x] Rebuild and test environment

## Key Technical Decisions
- Used `cron-parser` to handle timezone-aware interval calculations.
- Added a simple distributed lock using `ioredis` to prevent duplicate schedule runs if multiple scheduler instances are scaled up.
- Idempotency: If a bot already has a `queued` or `running` run, the scheduler skips spawning a new run to avoid overlaps.

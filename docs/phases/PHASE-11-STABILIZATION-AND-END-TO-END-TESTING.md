# Phase 11: Stabilization and End-to-End Testing

## Goal
Test the CrawlForge system from Phase 01 to Phase 10 end-to-end. Find and fix bugs without introducing new features. Ensure 0 build errors and high production reliability.

## Rules
- Test User: `test@crawlforge.local`
- Idempotent Seed Script.
- Minimal UI changes (fix bugs, no redesign).
- Classify bugs: critical, high, medium, low.
- TEST-REPORT.md must have PASS, FAIL, PARTIAL.
- Verify WebSocket, Cleanup, and Memory in Browser Recorder.
- Goal: `0 build error` on `docker compose up -d --build` and `npm run build`.

## Focus Areas
1. Authentication
2. Project CRUD (Especially "New Project" button bug)
3. Bot CRUD
4. Bot Builder (Drag/drop, steps)
5. Worker Run (Logs, datasets)
6. Loop + Pagination (Nested states, itemIndex, resilience)
7. Document Center (Downloads, localPath security, extraction)
8. Datasets (Approval, CSV export, Validation)
9. AI Settings & Playground (Secure keys, valid JSON parsing)
10. AI Jobs (Queueing, output mapping, default needs_review state)
11. Scheduler (Timezones, pause/resume, skip logic)
12. Browser Recorder (WS, cleanup, leaks)
13. Production Hardening (Health, rate limits, version headers)

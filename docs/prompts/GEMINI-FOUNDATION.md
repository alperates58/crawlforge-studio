# Gemini Prompt — Phase 01 Foundation

Use this prompt after documentation is ready.

---

Read these files first:

- README.md
- docs/STATUS.md
- docs/MEMORY.md
- docs/00-VISION.md
- docs/01-PRODUCT-SPEC.md
- docs/02-DATABASE-DESIGN.md
- docs/03-ARCHITECTURE.md
- docs/04-TECH-STACK.md
- docs/06-COOLIFY-DEPLOYMENT.md
- docs/phases/PHASE-01-FOUNDATION.md

Now implement Phase 01 only.

Do not implement Playwright, worker engine, AI extraction, PDF parser, scheduler or advanced scraping.

## Required Work

Build the application foundation:

1. Monorepo structure
2. React + Vite + TypeScript frontend
3. Node.js TypeScript API
4. PostgreSQL connection
5. Prisma setup and migration
6. Admin seed user
7. Email/password login
8. JWT auth
9. Dashboard
10. Project CRUD
11. Bot CRUD
12. Empty pages for Runs, Datasets, Documents and Settings
13. Docker Compose compatibility

## UI

Use a clean, modern, light theme.

Sidebar menu:

- Dashboard
- Projects
- Bots
- Runs
- Datasets
- Documents
- Settings

## Rules

- Keep the project name CrawlForge.
- Do not break Coolify deployment.
- Do not commit secrets.
- Use `.env.example`.
- Use soft delete/archive where applicable.
- Keep TypeScript types strict.
- Run build checks after changes.
- Update docs/STATUS.md after completing the phase.

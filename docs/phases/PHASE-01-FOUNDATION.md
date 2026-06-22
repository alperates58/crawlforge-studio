# Phase 01 — Foundation

## Goal

Build the stable application foundation.

## Scope

- Monorepo structure
- Frontend app
- API app
- PostgreSQL connection
- Prisma migrations
- Authentication
- Dashboard
- Project CRUD
- Bot CRUD
- Basic empty pages for future modules
- Docker Compose compatibility

## Out of Scope

- Playwright
- Worker engine
- AI extraction
- PDF parser
- Scheduler
- Advanced bot builder

## Checklist

- [x] Repository structure created
- [x] Web app created
- [x] API app created
- [x] Prisma configured
- [x] Initial migration created
- [x] Admin seed created
- [x] Login works
- [x] JWT auth works
- [x] Dashboard works
- [x] Project CRUD works
- [x] Bot CRUD works
- [x] Docker Compose builds
- [x] Coolify compatible

## Definition of Done

- `docker compose up -d --build` works.
- User can login.
- User can create/edit/archive projects.
- User can create/edit/archive bots.
- No Playwright or AI features are added yet.

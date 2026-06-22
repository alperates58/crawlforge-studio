# Product Specification

## Product Name

CrawlForge

## Short Description

No-code web data extraction, document ingestion and AI-powered structured data platform.

## Domain

```txt
databot.alperates.com.tr
```

## User Roles

### Admin

- Manage users
- Manage settings
- View all projects and bots
- Configure AI provider

### Operator

- Create projects
- Create bots
- Run bots
- Export data

### Reviewer

- Review extracted records
- Approve/reject data
- Correct AI extracted fields

## Main Modules

### Dashboard

Shows:

- Total projects
- Total bots
- Total datasets
- Last bot runs
- Last errors
- Records waiting for review

### Projects

Fields:

- Name
- Description
- Target domain
- Category
- Status

### Bots

Fields:

- Project
- Name
- Description
- Start URL
- Status
- Steps JSON

### Bot Builder

Step types:

- OPEN_URL
- CLICK
- TYPE
- WAIT
- SCROLL
- SELECT_OPTION
- EXTRACT_TEXT
- EXTRACT_ATTRIBUTE
- EXTRACT_LINKS
- DOWNLOAD_FILE
- LOOP_LINKS
- PAGINATION
- AI_EXTRACT
- SAVE_RECORD

### Runs

Tracks each bot execution.

### Datasets

Stores extracted structured records.

Statuses:

- draft
- needs_review
- approved
- rejected

### Documents

Stores downloaded files and extracted text.

### Settings

- AI provider
- API key
- Model
- Worker settings
- Storage settings

## MVP Scope

Phase 1 must only deliver:

- Login
- Dashboard
- Project CRUD
- Bot CRUD
- PostgreSQL
- Prisma
- Docker Compose compatibility

Do not start Playwright or AI before the foundation is stable.

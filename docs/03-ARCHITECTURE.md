# Architecture

## High-Level Architecture

```txt
Browser
  ↓
Web App
  ↓
API
  ↓
PostgreSQL
  ↓
Redis Queue
  ↓
Playwright Worker
  ↓
Storage / Documents
  ↓
AI Extractor
```

## Services

### Web

Frontend application.

Responsibilities:

- Login page
- Dashboard
- Projects UI
- Bots UI
- Dataset UI
- Settings UI

### API

Backend service.

Responsibilities:

- Authentication
- CRUD endpoints
- Queue job creation
- Dataset management
- Document metadata
- AI settings

### Worker

Background service.

Responsibilities:

- Execute bot steps
- Run Playwright
- Download files
- Extract text
- Save datasets
- Write logs

### PostgreSQL

Primary database.

### Redis

Queue backend for BullMQ.

### Storage

Persistent file storage for:

- Downloaded files
- Screenshots
- Extracted text
- Logs if needed

## Deployment

Coolify will deploy the Docker Compose project from GitHub.

## Routing

Recommended:

- Frontend: `/`
- API: `/api`
- Future WebSocket: `/ws`

## Design Rule

The frontend should not directly communicate with database or worker.

All user actions must go through API.

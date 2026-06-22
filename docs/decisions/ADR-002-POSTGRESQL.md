# ADR-002 — Use PostgreSQL

## Status

Accepted

## Context

CrawlForge stores structured JSON data, relational entities and audit logs.

## Decision

Use PostgreSQL as primary database.

## Consequences

Positive:

- Reliable relational database.
- JSONB support.
- Good for dataset storage.

Negative:

- Requires migrations and backup discipline.

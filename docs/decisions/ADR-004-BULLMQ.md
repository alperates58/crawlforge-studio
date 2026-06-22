# ADR-004 — Use BullMQ and Redis for Jobs

## Status

Accepted

## Context

Bot runs and document extraction should happen asynchronously.

## Decision

Use BullMQ with Redis.

## Consequences

Positive:

- Good Node.js job queue.
- Retry and status support.
- Works well with workers.

Negative:

- Requires Redis.
- Needs monitoring for failed jobs.

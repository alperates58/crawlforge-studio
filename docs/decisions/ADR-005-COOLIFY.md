# ADR-005 — Deploy with Coolify

## Status

Accepted

## Context

The project should be deployable from GitHub with redeploy support.

## Decision

Use Docker Compose deployment through Coolify.

## Consequences

Positive:

- Simple self-hosted deployment.
- GitHub push + redeploy workflow.
- Easy service management.

Negative:

- Docker Compose files must stay stable.
- Persistent volumes must be configured carefully.

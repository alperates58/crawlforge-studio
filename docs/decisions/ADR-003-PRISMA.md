# ADR-003 — Use Prisma ORM

## Status

Accepted

## Context

The project needs typed database access and migrations.

## Decision

Use Prisma.

## Consequences

Positive:

- Strong TypeScript support.
- Good migration workflow.
- Easy onboarding for AI coding agents.

Negative:

- Some complex SQL may need raw queries later.

# ADR-001 — Use Playwright for Browser Automation

## Status

Accepted

## Context

CrawlForge needs to interact with modern websites that use JavaScript, login flows, clicks, scrolling and dynamic content.

## Decision

Use Playwright for browser automation.

## Consequences

Positive:

- Handles modern web apps better than simple HTTP scraping.
- Supports Chromium-based flows.
- Good for click/type/wait/scroll automation.

Negative:

- More resource intensive than HTTP scraping.
- Requires worker isolation.
- Needs careful concurrency control.

# CrawlForge Project Memory

This file preserves important project context and decisions so the project does not lose direction over time.

## Original Motivation

The first goal was to build a cosmetic ingredient, raw material and formulation intelligence database.

Before building the cosmetic database, we decided to build a reusable no-code data extraction engine.

## Why Not Just ChatGPT?

Chemists and technical users already use ChatGPT.

CrawlForge should provide value through:

- Structured data
- Source tracking
- Review workflow
- Reusable extraction bots
- Document ingestion
- Controlled data approval

## Selected Product Name

CrawlForge

Meaning:

- Crawl: web crawling / web scanning
- Forge: shaping, building, producing

## Domain

```txt
databot.alperates.com.tr
```

## Major Product Decisions

- The project should start with documentation and phases.
- Do not build all features at once.
- Do not start with scraping engine before app foundation.
- AI output must be reviewable, not automatically approved.
- The system must avoid illegal/unsafe scraping features.
- Coolify deployment from GitHub is mandatory.

## Current Development Rule

Every major sprint must update:

- docs/STATUS.md
- related PHASE file
- related ADR if a technical decision changes

# Phase 03 — Worker Engine

## Goal

Execute bot steps using Playwright through a queue-based worker.

## Scope

- Redis queue
- BullMQ setup
- Worker app
- Manual bot run
- Run logs
- Step logs
- Basic Playwright execution

## Supported Execution Steps

- OPEN_URL
- CLICK
- TYPE
- WAIT
- SCROLL
- EXTRACT_TEXT
- EXTRACT_LINKS
- SAVE_RECORD

## Checklist

- [ ] Queue created
- [ ] Worker service created
- [ ] Manual run button
- [ ] Run status tracking
- [ ] Step logs
- [ ] Error handling
- [ ] Dataset record save

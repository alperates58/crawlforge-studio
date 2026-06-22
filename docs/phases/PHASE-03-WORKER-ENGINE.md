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

- [x] Queue created
- [x] Worker service created
- [x] Manual run button
- [x] Run status tracking
- [x] Step logs
- [x] Error handling
- [x] Dataset record save

# Phase 07: Loop Links and Pagination

## Goal
Enhance CrawlForge's ability to scrape complex multi-page structures. This phase enables bots to extract arrays of URLs, navigate into them seamlessly (detail page processing), and handle list pagination automatically without writing manual scripts.

## Details
1. **Database Schema**: 
   - Expanded `BotStepLog` model to include `pageIndex`, `itemIndex`, and `parentStepIndex`. This gives execution tracking deep context for nested steps.
2. **New Worker Handlers**:
   - `PAGINATION`: Clicks the "Next" button repeatedly and executes nested steps on each page up to a `max_pages` safety limit. Includes infinite loop guards that check URL uniqueness dynamically.
   - `LOOP_LINKS`: Reads extracted lists of URLs from memory, deduplicates, normalizes relative URLs into absolutes, and spins up a brand new Playwright tab (`context.newPage()`) for each link. It executes nested steps inside this isolated tab, preventing the main DOM list page from breaking.
   - `GO_TO_LINK`: Simple handler to navigate the main context to a dynamic URL stored in memory.
3. **Bot Builder Enhancements**:
   - Added the new `LOOP_LINKS`, `PAGINATION`, and `GO_TO_LINK` to the step picker menu.
   - Initial straightforward nested UI via a dedicated inline JSON editor inside the `StepEditor` properties pane.
4. **Run Engine Logging**:
   - Run details UI now visually indents nested logs using `parentStepIndex`.
   - Distinct UI badges render `Page X` and `Item Y` alongside step details for instantaneous diagnostic checks.
5. **Data Accumulation (`SAVE_RECORD`)**:
   - Configured the Dataset saver to implicitly read the exact URL of the isolated Playwright tab when fired inside a loop, ensuring accurate Data Provenance.

## Status
Completed.

## Next Phase
Integration of advanced configurations (Schedulers, Browser recorders, etc.) and Knowledge Graph implementations.

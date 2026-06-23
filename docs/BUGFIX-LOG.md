# Bugfix Log

| ID | Module | Severity | Description | Reproduction Steps | Fix Summary |
|---|---|---|---|---|---|
| 01 | Project CRUD | High | New Project button does nothing | Click "New Project" on Projects page | Added state and modal form to create a project via API |
| 02 | Project CRUD | Medium | No way to delete projects | Try to delete a project | Added DELETE /api/projects/:id endpoint and UI button |
| 03 | Project CRUD | Medium | No way to edit projects | Try to edit a project | Added Edit UI button and connected to PUT endpoint |
| 04 | Bot CRUD | High | New Bot button does nothing | Click "New Bot" on Bots page | Added modal with project selector, name, startUrl fields |
| 05 | Seed Data | Critical | Test bots use parameters wrapper, worker expects flat step format | Run Simple Test Bot → Step 0 OPEN_URL fails: URL required | Fixed seed to use flat step format (step.url not step.parameters.url) |
| 06 | Worker | Critical | durationMs crash: botRun.startedAt is null at calculation time | Run any bot → crash: Cannot read properties of null (reading getTime) | Used local startTime variable instead of stale botRun.startedAt |
| 07 | AI Worker | Critical | ai-worker container crash loop: missing libssl.so.1.1 | ai-worker restarts continuously | Changed ai-worker base image to `node:20-bookworm-slim` |
| 08 | Worker / Loop | High | LOOP_LINKS crashes with "Please use browser.newContext()" | Run Loop Test Bot | Changed `browser.newPage()` to `browser.newContext().newPage()` in runner.ts |
| 09 | Worker / Doc | High | OPEN_URL crashes with "Download is starting" on direct PDF links | Run Document Test Bot | Updated seed data to navigate to an HTML page and use DOWNLOAD_FILE step with selector |

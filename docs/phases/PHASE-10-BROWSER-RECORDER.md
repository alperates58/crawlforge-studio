# Phase 10: Browser Recorder

## Goal
Implement a visual browser recorder to capture user actions (clicks, types, scrolls) over a remote headless browser and convert them into bot steps using Playwright CDP Screencast.

## Tasks Completed
- [x] Create `RecorderSession` database model with tracking fields (`status`, `recordedStepsJson`, `startUrl`).
- [x] Create backend API endpoints for session creation, fetching, stopping, and cleanup in `apps/api`.
- [x] Implement 1 max active session limit per user.
- [x] Add a new `apps/recorder-worker` container running an Express and WebSocket server on port 3002.
- [x] Integrate Playwright `CDP Session` via `Page.startScreencast` to stream remote browser view to the frontend.
- [x] Automatically compute optimal resilient CSS/Text selectors using `data-testid`, `aria-label`, `placeholder`, and structural fallback paths, tagged with `weak` where necessary.
- [x] Support capturing `CLICK`, `TYPE`, `SCROLL`, and `WAIT` interactions.
- [x] Add a `Recorder` UI tab inside the Bot Builder.
- [x] Incorporate manual type/wait input actions in the UI sidebar.
- [x] Apply a 15-minute automatic cleanup timeout for active sessions.

## Technical Decisions
- **CDP Screencast vs VNC**: We chose the Playwright internal screencast functionality, bypassing complicated VNC, NoVNC, or reverse-proxy X11 requirements. This performs exceptionally well for low-framerate browser recording entirely within the web UI.
- **In-DOM Selector Computation**: When a user clicks on the screencast canvas, coordinates are sent via WS. The worker executes `document.elementFromPoint` in the browser context to dynamically generate the best CSS/Text selector string based on priority rules (`data-testid`, `aria-label`, etc.).
- **Manual Type/Wait Injection**: Fully capturing arbitrary keystrokes across varying OS contexts from an image tag is error-prone in an MVP. A dedicated sidebar input handles structured text injection (`page.keyboard.type`) cleanly.

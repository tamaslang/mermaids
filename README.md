# Mermaids

An underwater side-scrolling browser game starring a mermaid. Plain HTML/CSS/JS, no build step.

## Run

    python3 -m http.server 4174

Open http://localhost:4174.

## Test

    npm ci
    npx playwright install chromium
    npm test

## Workflow

All changes go through pull requests; CI (Playwright) must pass.

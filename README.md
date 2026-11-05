# Mermaids

An underwater side-scrolling browser game starring a mermaid. Plain HTML/CSS/JS, no build step.

## Run

    python3 -m http.server 4174

Open http://localhost:4174.

## Controls

Arrow keys / WASD swim, Space does a flip. Swim to the coral reef and press Enter to go home (Enter again leaves); inside, press E near a sofa to sit. Hold B to blow bubbles; press H near an animal to say hello. Swim east to the RACE cave and press Enter to start a hoop race: swim through every hoop (they vanish) and pop bubbles for bonus points; Enter returns to the sea. Visit the croissant-shaped BAKERY further east: swim in front of a pastry and press T to take it, then E to eat it.

## Test

    npm ci
    npx playwright install chromium
    npm test

## Workflow

All changes go through pull requests; CI (Playwright) must pass.

Testing convention: every feature ships with Playwright tests in the same PR.
Keep them lean, but the minimum is a happy-path test, and for anything drawn
on a canvas, a check that the canvas is painted and the page throws no errors.

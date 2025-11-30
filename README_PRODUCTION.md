# TwoHearts React — Cleaned Production Archive

This archive is a cleaned version of the repository prepared for production delivery.

**Actions performed**
- Removed `node_modules/` and `.git/` to reduce archive size.
- Added `.gitignore`.
- Included recommended CI and Docker files (see /ci and /docker).

**How to run**
1. `npm install`
2. `npm run dev` (development)
3. `npm run build` (production build)

**Notes**
- No external network access was used; automated build/tests were not run here.
- Please run `npm install` locally and `npm run build` to ensure dependencies install and the app builds in your environment (Node >=18 recommended).


## Production validation & 7-iteration checklist (how to run locally)

This repo includes CI automation to perform **7 iterative validations** (lint, test, build, a11y, analyze).
Because this environment cannot run `npm install`, run the following on your machine or in GitHub Actions.

1. Install dependencies:
   ```
   npm ci
   ```
2. Run lint and fix:
   ```
   npm run lint --if-present
   ```
3. Run unit tests:
   ```
   npm test --if-present
   ```
4. Run build:
   ```
   npm run build
   ```
5. Run accessibility tests:
   - Playwright + axe:
     ```
     npx playwright install
     node tests/axe-runner.js
     ```
6. Run lighthouse-ci locally (optional):
   ```
   npm i -g @lhci/cli
   lhci autorun
   ```
7. Docker preview:
   ```
   docker build -t twohearts:prod .
   docker run -p 8080:80 twohearts:prod
   ```

### If any step fails
- Copy the full terminal error output and paste it back here; I will analyze logs and provide precise code/config fixes line-by-line.


## PWA and Accessibility features added
- Added manifest.json and service-worker.js for basic offline capability.
- Accessibility preferences component (`src/components/AccessibilityPreferences.jsx`) persisted in localStorage.
- Analytics stub at `src/utils/analytics.js`.

## Production Readiness Enhancements
- **Docker**: Runs as non-root user `node` for security. Uses `tini` as init process to handle signals correctly.
- **Startup**: `start.sh` script automatically runs database migrations before starting the server.
- **Performance**: `compression` middleware enabled for Gzip/Brotli compression.
- **Logging**: `winston` + `morgan` configured for structured JSON logging in production.
- **Security**: `helmet` configured for secure headers.

Run `npm ci` then `npm run build` and `npm start`. Visit the app and check in browser devtools > Application > Service Workers to verify registration.

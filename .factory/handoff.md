# Chore Rulebook v1 handoff

## What shipped

- Complete shared-device setup for a household and named people, including
  availability that visibly affects rotations.
- Recurring chore rules with interval, estimated minutes, ordered rotation or
  fixed owner, and explicit hold/pass recovery for missed turns.
- Due/upcoming board with a plain-language explanation for every assignment.
- Completion capture with actual person, date, optional factual note, local
  history, delete/undo, and seven-day estimated-effort context.
- IndexedDB persistence, JSON backup/restore, CSV history export, and a
  device-local printable QR snapshot transfer.
- Installable PWA manifest, 192/512/maskable icons, versioned service worker,
  app-shell caching, navigation fallback, update notice, and explicit offline
  state.
- Free tier (six chores, all core logic/history/exports) plus $12 one-time
  Household Plus unlock (unlimited chores and printable pairing). Checkout,
  capture, daily-cached verification, offline optimistic verdict, invalidation,
  and paste-to-restore follow the Sociobot billing contract.
- Product-specific pixel/demoscene visual system and original generated hero,
  with exact prompt/review/provenance in `.factory/design.md` and `assets/src/`.
- Responsive 390px layout, keyboard/focus treatment, reduced-motion behavior,
  `/privacy`, `/terms`, README, and MIT license.

## How to run and verify

```sh
npm ci
npm test
npm run build
npm run test:e2e
```

Deployment build command: `npm run build`

Deployment directory: `./dist` (`dist/index.html` is present at its root).

Verification on 2026-08-28:

- Unit tests: 4 passed.
- Playwright Chromium desktop + 390×844 mobile: 10 passed, covering the complete
  setup/add/explain/complete/history/refresh flow, direct legal routes, and
  explicit offline reload.
- Axe WCAG 2 A/AA scan: 0 serious or critical violations in both desktop and
  mobile empty states.
- Factory `verify-url.sh`: HTTP 200, title present, `lang=en`, one `h1`, main
  landmark present, 0 missing image alts, 0 unlabeled buttons, 0 console/page
  errors.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100,
  SEO 100; LCP 1.5 s, CLS 0, total blocking time 0 ms.
- Production bundle: 36.8 KB initial app JS plus 25.9 KB lazy QR chunk, 18.9 KB
  CSS, 35 KB 768px hero WebP, 17 KB 480px hero WebP. Initial JS and all visual
  assets are inside their budgets; no fonts are downloaded.

## Known gaps and next steps

- Pairing is a deliberate one-time snapshot replacement, not live multi-device
  sync. This keeps v1 local and account-free; export the newer device before
  replacing existing data.
- Billing verification depends on the factory registering the slug and the
  production Sociobot API. The network contract and failure/offline behavior
  are implemented, but a real purchase token is not stored in this repository.
- The product sends no analytics, so the 30-day success measure must be assessed
  by the household from its exported history rather than remote telemetry.

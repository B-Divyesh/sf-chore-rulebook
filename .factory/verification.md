# Independent product verification — FAIL

- Work order: `chore-rulebook-verify-1`
- Candidate: `ce03cac95516b3c016f02c027c3db63bffabb469`
- Branch: `main`
- Live URL: <https://chore-rulebook.sociobot.in>
- Verified: 2026-08-29 UTC
- Result: **FAIL — do not release**

The checkout began with a clean worktree at the requested commit. After the
production build, every one of the 18 files in `dist/` was downloaded from the
live origin and compared byte for byte. All 18 matched. The findings below are
therefore findings in the candidate, not stale-deployment differences.

## Mandatory gates

### Claims gate — FAIL (release blocker)

`.factory/claims.json` does not exist. The required first command stopped with:

```text
RELEASE_BLOCKER: .factory/claims.json missing
```

There were consequently no claim commands to run through the demo entry point.
The live site and README nevertheless make observable claims about offline use,
device-local privacy, CSV/JSON export, QR pairing, the six-chore free tier, and
the paid unlock. None is registered in the required claims manifest.

### Cold first-read and demo gate — FAIL (release blocker)

Cold-read interpretation: this is a shared-device app for a household that
rotates recurring chores, explains each assignment, and records local history.
The apparent first action is **Set up this household**.

The first screen does not itself meet the contract:

- Its `<h1>` is only `Chore Rulebook`; the visually prominent job statement is
  an `<h2>`.
- The copy does not plainly name the intended audience in the required
  who-and-change sentence.
- At 390 × 844, the setup action and the three facts are below the first
  viewport.
- There is no **Try it with sample data** action anywhere.
- `/demo` returns the ordinary empty onboarding screen, with no sample data,
  no isolated storage namespace, no demo banner, no reset, and no start-for-real
  action. Its title is also the ordinary product title rather than a demo title.
- `.factory/demo.md` is missing.

This gate independently makes the candidate a FAIL.

## Defects

### Blocker

1. **Required claim manifest and claim tests are absent.** See the claims gate
   above. This is an explicit release blocker in the acceptance contract.
2. **The required one-click sandbox demo and compliant first screen are absent.**
   See the cold first-read gate above. This is also an explicit automatic FAIL.

### High

1. **The advertised paid purchase cannot be made.** A live `GET` to
   `https://api.sociobot.in/api/v1/products/chore-rulebook/checkout` returns
   HTTP 404 with `{"error":"enabled factory product","status":404}`. The
   product links this endpoint from **Buy Household Plus** and advertises a $12
   one-time purchase.
2. **A plausible malformed backup can persist data that bricks the app.** The
   import validator checks only a few container fields. A version-1 backup with
   string `intervalDays` and an invalid `createdAt` is accepted and persisted.
   Opening Today raises `Invalid time value`; reloading `/?view=today` leaves
   `#app` empty and raises the same page error. There is no in-product recovery
   path, so browser site-data controls are required.
3. **The offline shell does not precache its core JS or CSS.** After one cold
   visit and service-worker readiness, clearing the ordinary HTTP cache and
   going offline produces a blank app. Requests for
   `/assets/index-Dxj1mv5k.js` and `/assets/index-RR10NKLy.css` fail. The shell
   cache lists HTML, icons, manifest, and images, but not these two required
   assets. The ordinary offline test passes only while browser cache is
   available or after an extra controlled online reload.
4. **The Data view has a critical axe violation.** `#import-file` has no label,
   `aria-label`, or `aria-labelledby`. Axe reports rule `label`, impact
   `critical`. The repository test scans only the empty state, so it misses the
   affected view.

### Medium

1. **Browser Back changes the URL without restoring the view.** After visiting
   People and then Data, Back changes the address from `?view=data` to
   `?view=people`, but the visible heading remains `Move, back up, or unlock`.
   The `popstate` handler rerenders the current in-memory view instead of reading
   the URL.
2. **Whitespace-only names are accepted.** A household name containing only
   spaces is stored as an empty string, closes the dialog, and returns the user
   to onboarding with partially stored people. Whitespace-only person and chore
   names are also accepted, producing blank rows and assignments.
3. **Printable pairing fails for modest real history.** With a valid cached
   unlock, a 1,450-byte state produces a QR. A 7,789-byte state containing six
   chores and 40 completions shows `The pairing code could not be drawn` and a
   blank canvas. That is a realistic history size for the stated 30-day job and
   conflicts with the paid pairing promise.
4. **Responsive/accessibility sizing has gaps.** The People view's transparent
   checkboxes retain global `width: 100%`, making the document 2,555 px wide in
   a 1,440 px viewport and 454 px wide at 390 px. The Chores view reaches 685 px
   document width at 390 px. Visible interactive targets below the required
   44 px height include the 40 px brand link, the 25 px assignment disclosure,
   and 20 px Privacy/Terms links.
5. **Required deployment structure and headers are incomplete.** There is no
   `staticwebapp.config.json`; responses have HSTS, `Referrer-Policy`, and
   `X-Content-Type-Options`, but no CSP/frame-ancestors policy. Hashed assets are
   served with `Cache-Control: public, must-revalidate, max-age=30`, not
   long-lived immutable caching. `/404` and an unknown path both return the
   home shell with HTTP 200; there is no designed 404. Canonical, Open Graph,
   Twitter card, Apple touch icon, social image, footer factory attribution,
   and visible build ID are absent.
6. **Required copy/demo audit artifacts are absent.** In addition to claims,
   `.factory/demo.md` and `.factory/copy-audit.md` do not exist.

## Passing evidence

### Clean install, tests, and build

```text
npm ci                         PASS (90 packages, 0 vulnerabilities)
npm test                       PASS (4/4 Vitest tests)
npm run build                  PASS (TypeScript + Vite; dist/ produced)
npm run test:e2e               PASS (10/10 Playwright tests)
npm run check                  PASS (repeated test + build + e2e)
```

There is no separate lint script. `npm run build` is the available type/build
gate and completed successfully.

Production sizes:

- Initial app JS: 36.76 KB raw / 13.29 KB gzip
- Lazy QR JS: 25.88 KB raw / 10.17 KB gzip
- CSS: 18.93 KB raw / 5.04 KB gzip
- Mobile hero WebP: 16.74 KB; larger WebP: 34.85 KB
- Lighthouse total initial transfer: 55 KiB

These pass the bundle budgets.

### Useful workflow

The following live, fresh-context workflow passed without console or page
errors:

- Create `Cedar House` with Alex, Bo, and Casey.
- Reject interval `0` and effort `4`; accept maximum interval `365` and effort
  `600`.
- Add rotation and fixed-owner chores; a fixed rule without an owner gives a
  clear inline error and recovers after selecting Bo.
- Mark Casey away and see the assignment explanation report that one away
  person was skipped.
- Record a completion with punctuation and quotes in its note.
- Export CSV with correct headers/escaping and JSON with all people, chores,
  and completions.
- Reject malformed JSON with a visible toast; import a valid backup and render
  its household, person, and chore.
- Delete and undo a completion.
- Preserve history through reload and through an ordinary offline reload.
- Enforce the free-tier limit at exactly six chores and route the seventh add
  attempt to the Plus explanation.
- Invalid license restore calls only the documented verification endpoint and
  displays `That license is not active for Chore Rulebook.`

The four rule unit tests cover rotation advancement, skipping an away person,
fixed-owner-away status, missed-interval passing, and seven-day effort totals.

### Privacy and network behavior

The full free workflow recorded only the origin
`https://chore-rulebook.sociobot.in`. Export and ordinary household actions made
no third-party requests. Entering an invalid license explicitly made one request
to the documented `https://api.sociobot.in/.../verify?license=...` endpoint and
sent no household data. There are no sign-in flows, analytics, third-party
fonts, or runtime CDN requests.

The verification endpoint returned 200 with
`{"expires_at":null,"reason":"invalid","valid":false}` for a bad token. In a
single burst, requests 1–30 returned 200 and burst request 31 returned 429 with
`Retry-After: 3` and `X-RateLimit-After: 3`. Thus the observed burst allowance
was 30 successful requests before throttling.

### Accessibility and responsive checks

- Skip link is the first Tab stop at desktop and 390 px; it has a visible 3 px
  amber outline and moves focus to `main`.
- Native dialog Escape behavior restores focus to its trigger.
- Axe serious/critical results were zero on onboarding, setup dialog, Today,
  People, Chores, and History on both desktop and 390 px.
- The Data view exception is the critical unlabeled-file-input defect above.
- Reduced-motion media changes transitions and animations to effectively
  instant.
- Cold and populated normal flows produced no console errors. The corrupt
  import case deliberately reproduces the page error described above.

### PWA, performance, and live identity

- Chrome parses the manifest without errors; the active service worker controls
  the page and uses versioned `rulebook-v1.0.2-*` caches.
- Offline `/`, `/privacy`, and `/terms` work after an online controlled reload.
- A controlled update simulation using the exact production build displayed
  `An update is ready. Reload to use it.` with a Reload action.
- The first-visit/cache-eviction failure is documented above.
- Lighthouse mobile: performance 100, accessibility 100, best practices 100,
  SEO 100; FCP 1.0 s, LCP 1.1 s, TBT 40 ms, CLS 0, speed index 1.3 s.
- Root page load returned 200 with no console errors. Privacy and Terms direct
  routes returned 200 with route-specific titles and one `<h1>`.
- All 18 locally built deployment files byte-match the live files.

## Release decision

**FAIL.** The missing claims contract and missing sandbox demo each force a
failure on their own. The dead checkout, unsafe import, incomplete offline
precache, and critical accessibility violation are additional release blockers.

# Adversarial first-read review 2 — Chore Rulebook

- Reviewed: 2026-08-29 UTC
- Live target: <https://chore-rulebook.sociobot.in>
- Source reviewed: `7bc0ba6bc88d96d8c069656dd6db0f04d2466e20`
- Verdict: **FAIL**

The primary task is clear and the demo is immediately usable, but this is not a
zero-finding release. Two live routing/skeleton requirements are incomplete and
one checkout/refund statement is not covered by the registered claims. The
findings are ordered by severity. None is a demo or core-workflow blocker.

## Cold first read

Fresh Chromium contexts at 390 × 844 and 1440 × 900 loaded `/` with HTTP 200,
no console errors, and no page errors. Before scrolling, the mobile screen said:

- **What it does:** rotates recurring household chores, tells the household who
  is assigned, and records completed chores.
- **For whom:** households sharing recurring chores on one device.
- **First click:** **Try it with sample data**, which says it opens a ready-made
  household.

The required first-read answers are visible within the mobile viewport. The
primary action, real setup action, and three facts all fit at 390 px. This
check passes.

## Findings

### Minor — F-2-1: the header is not consistent across application routes

- **Location / exact evidence:** Live `/`, `/privacy`, and `/terms` headers
  contain only the Chore Rulebook home link and the `DEVICE READY` signal.
  They do not contain navigation links for **Demo**, **Privacy**, or **Terms**.
  The root source makes this intentional in `src/main.ts`:
  ```${legal || landing ? '' : navigation()}```. Live `/demo` instead contains
  the application signal rail, and `public/404.html` contains a separate
  `Demo` / `Privacy` / `Terms` header navigation.
- **Why this fails:** a visitor receives different navigation affordances on
  the landing, legal, demo, and 404 routes. This does not meet the required
  consistent header skeleton (wordmark, skip link, and up to four useful nav
  links), even though the footer does expose the legal links.
- **Concrete fix:** render the same compact header navigation on `/`, `/demo`,
  `/privacy`, and `/terms`, for example **Demo**, **Privacy**, and **Terms**.
  Keep the populated-app signal rail as the product section navigation rather
  than as a replacement for the site header. Add a route-by-route regression
  that asserts those header links and their targets.

### Minor — F-2-2: in-app view navigation changes the URL and heading but not the document title

- **Location / exact evidence:** from live `/demo`, selecting **People** opens
  `https://chore-rulebook.sociobot.in/demo?view=people` and focuses the h1
  **“People and availability”**. Its document title remains
  **“Demo — Chore Rulebook”**. The same occurs for Today, Chores, History, and
  Data. In `src/main.ts`, `shell()` sets every demo view to
  ``isDemoMode() ? 'Demo — Chore Rulebook'``; the view-button handler calls
  `history.pushState` and `shell()` without a view-specific title.
- **Why this fails:** these are real, deep-linkable browser-history states.
  A browser tab, history entry, bookmark, and screen reader route announcement
  should identify the actual current view. The heading changes correctly, but
  the title contract is not updated on navigation.
- **Concrete fix:** assign a title derived from the active view after every
  view change and `popstate`, for example **“People and availability — Chore
  Rulebook”**. Keep **“Demo — Chore Rulebook”** only for the default demo
  Today state if that is the intended route label. Add assertions for each
  `?view=` state and Back navigation.

### Minor — F-2-3: the README makes an untested refund/merchant-of-record promise

- **Location / exact quote:** `README.md`, Household Plus: **“Sociobot/Dodo
  handles checkout and refunds as merchant of record.”** The same promise is
  repeated in `/terms`: **“Sociobot/Dodo is the merchant of record and handles
  payment and refunds.”**
- **Why this fails:** `plus-purchase` proves the $12 price and that the
  checkout endpoint returns a Dodo checkout redirect. It does not test, or
  otherwise register, the separate promise that refunds are handled by that
  merchant. A buyer could rely on that statement; it must have a claim entry
  with observable evidence, or it must not be presented as a product promise.
- **Concrete fix:** either add a distinct `merchant-refunds` claim with a
  deterministic test/fixture that verifies the registered refund policy and
  destination, or reduce the copy to the proven fact, such as **“Checkout
  opens through Dodo.”** Link to the applicable refund terms if the policy
  must be disclosed.

## Copy audit

Counts treat a hyphenated compound as one word and include headings, buttons,
facts, image alt text, and footer sentences because each is visitor-facing
copy. No landing or README sentence exceeds 22 words. `F-2-3` is the only
copy finding; it is an untested reliance claim, not a length, jargon, or
terminology failure.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Chore rules for a shared device | 6 | Pass |
| Know whose turn it is—and why | 7 | Pass |
| For households sharing recurring chores, it rotates clear assignments and records what was done. | 14 | Pass |
| Try it with sample data | 5 | Pass; result-naming verb |
| Set up this household | 4 | Pass; result-naming verb |
| The sample opens a ready-made household. | 6 | Pass |
| Setup starts your private rulebook. | 5 | Pass; device-local claim covers the privacy meaning |
| Stored on this device | 4 | Pass; `device-local` |
| Works offline after the first visit | 6 | Pass; `offline-reload` |
| Free for six chores | 4 | Pass; `six-chore-tier` |
| A pixel-art cutaway home where glowing routes connect dishes, laundry, plants, and a broom. | 14 | Pass; image alt |
| The sample shows chores, assignments, and household rules on one shared device. | 12 | Pass |
| How it works | 3 | Pass |
| Set rules in three steps | 5 | Pass |
| Add people. | 2 | Pass |
| Keep household order and mark anyone away. | 7 | Pass |
| Write chore rules. | 3 | Pass |
| Choose rotation or a fixed owner. | 6 | Pass |
| Record completions. | 2 | Pass |
| See the next assignment and its reason. | 7 | Pass |
| What stays private | 3 | Pass |
| Names, rules, and history remain in browser storage. | 8 | Pass; `device-local` |
| The app has no accounts, ads, analytics, or household-data server. | 10 | Pass; `private-runtime` |
| Your household data stays on this device. | 7 | Pass; `device-local` |
| Built by Param Factory. | 4 | Pass; required attribution |
| Original house illustration generated with the factory image model. | 9 | Pass; provenance |

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Know whose turn it is—and why. | 7 | Pass |
| Chore Rulebook helps households rotate recurring chores and keep a completion history on one shared device. | 16 | Pass |
| Open the one-click sample at `https://chore-rulebook.sociobot.in/demo`. | 6 | Pass |
| Demo changes use separate storage and never change a real rulebook. | 10 | Pass; `demo-isolation` |
| Live product: `https://chore-rulebook.sociobot.in` | 3 | Pass |
| Rotations follow household order and skip people marked away. | 8 | Pass; `explain-assignment` |
| Fixed-owner rules keep the same person responsible. | 6 | Pass; `fixed-owner` |
| Each assignment includes a plain-language reason. | 6 | Pass; `explain-assignment` |
| Completion history can be exported as JSON or CSV. | 8 | Pass; export claims |
| JSON backups can be restored on this device. | 8 | Pass; `json-restore` |
| The app works offline after the first visit. | 8 | Pass; `offline-reload` |
| The free rulebook accepts six chores. | 6 | Pass; `six-chore-tier` |
| A $12 one-time Plus purchase adds unlimited chores and printable QR pairing. | 12 | Pass; Plus claims |
| Privacy and terms routes at `/privacy` and `/terms` | 8 | Pass |
| Requires Node.js 20 or newer. | 6 | Pass; setup instruction |
| Open the printed local URL. | 5 | Pass |
| `npm run build` is the deployment build command. | 8 | Pass; setup instruction |
| It writes the static site to `./dist`, with `dist/index.html` at the root. | 13 | Pass; build output |
| End-to-end tests expect the factory-pinned Playwright 1.58.2 Chromium browser. | 12 | Pass; setup instruction |
| Names, rules, completion history, and notes never leave the device unless the user exports a file or shows a pairing QR. | 21 | Pass; privacy and QR claims |
| A pairing QR embeds a snapshot in the URL fragment; it does not upload it. | 15 | Pass; `qr-pairing` |
| License verification sends only the saved license token to `api.sociobot.in`. | 12 | Pass; `license-token-only` |
| There are no analytics, ads, third-party fonts, or runtime CDNs. | 9 | Pass; `private-runtime` |
| The free rulebook supports six chores with rules, history, and exports. | 11 | Pass; tier/export claims |
| Household Plus costs $12 once and adds unlimited chores and printable QR pairing. | 12 | Pass; Plus claims |
| Sociobot/Dodo handles checkout and refunds as merchant of record. | 9 | **F-2-3** |
| If a refund revokes a license, paid features return to free limits. | 12 | Pass; `license-revocation` |

Terminology is consistent: **rulebook** is the saved household workspace,
**chore rule** is a recurring task and assignment rule, **assignment** is the
current responsibility, **completion** is a recorded finished chore, **demo**
is the sample workspace, and **Plus license** is the paid entitlement.

## Demo, sandbox, claims, and privacy

- The first-screen **Try it with sample data** link opened `/demo` in one click.
  The first post-click screen was the populated Today view for Cedar House with
  four assignment cards, not onboarding.
- The live persistent banner read **“Demo — sample data, nothing is saved to
  your rulebook”** and included **Reset demo** and **Start for real**.
- In a fresh live context, a real `Review 2 Real Home` rulebook survived demo
  entry, a demo availability change, Reset, and Start for real. During demo,
  IndexedDB contained `chore-rulebook` and `demo:chore-rulebook`; after exit it
  contained only `chore-rulebook`. Reset restored the sample availability.
- The live demo request log contained only
  `https://chore-rulebook.sociobot.in`. After service-worker control and an
  offline reload, it still displayed the demo banner and **Today’s household
  chores**, without console errors.
- From a fresh clone at `/tmp/chore-rulebook-review-2.PwsAzv`, `npm ci` and all
  16 exact commands in `.factory/claims.json` passed independently:
  `offline-reload`, `device-local`, `json-export`, `json-restore`, `csv-export`,
  `explain-assignment`, `six-chore-tier`, `qr-pairing`, `demo-isolation`,
  `fixed-owner`, `missed-turn-advance`, `plus-unlimited-chores`,
  `license-token-only`, `private-runtime`, `plus-purchase`, and
  `license-revocation`.
- The same clone's `npm run check` passed: 15 Vitest tests, TypeScript,
  production build, and 64 Playwright tests. The built app JavaScript is
  25.88 kB + 43.64 kB raw (25.53 kB gzip total); CSS is 21.08 kB raw.

## Structure and history

- The earlier findings are fixed, not merely marked fixed: live
  `/manifest.webmanifest` returns `application/manifest+json`; the unknown
  route returns an HTTP 404 with a product header, footer, legal links,
  metadata, canonical URL, favicon, and the plain h1 **Page not found**; the
  old hero/footer slogans and README implementation jargon are absent.
- `/`, `/demo`, `/privacy`, and `/terms` are HTTP 200 with one h1, `lang=en`,
  a main landmark, meta description, canonical, Open Graph metadata, favicon,
  and 390 px width equal to document width. The 404 has the same metadata and
  a genuine HTTP 404. The expected browser network diagnostic for that status
  is not an application console error.
- All normal internal links discovered on the landing, demo, legal, and 404
  pages return HTTP 200. The 404 page's same-document `#main` skip link keeps
  the intentional 404 status, but works as an in-page skip link.
- The pixel household-signal identity is distinct and follows the documented
  visual thesis; it is not a generic SaaS card/gradient treatment.
- The brief does not imply a missing AI feature or remote sync. The product
  already supplies the valuable local-first transfers: JSON export/import, CSV
  history export, and printable QR pairing. No runtime AI key or decorative AI
  feature was found.

## What would make this perfect

Use one consistent site header on every application route, give every
deep-linkable `?view=` state an accurate document title, and either prove or
remove the refund/merchant-of-record promise. Re-run the header/title browser
checks, the related claims manifest check, and the full first-read audit. A
PASS requires those changes and no remaining findings.

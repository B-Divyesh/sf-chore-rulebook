# Adversarial first-read review 1 — Chore Rulebook

- Reviewed: 2026-08-29 UTC
- Live target: <https://chore-rulebook.sociobot.in>
- Verdict: **FAIL**

The product is immediately understandable and tryable, but the prior handoff's unfixed manifest MIME finding is still live. Under this review's history rule, an earlier finding that remains unfixed is a blocking finding. There are also copy and 404-route contract failures below. A PASS requires zero findings.

## Cold read

Fresh 390 × 844 and 1440 × 900 Chromium contexts loaded without console or page errors. Before scrolling, the answer was:

- **What it does:** rotates recurring household chores, explains the current assignment, and records completions.
- **For whom:** households sharing recurring chores on one device.
- **First click:** **Try it with sample data**; it says that this opens a ready-made household.

All three answers are visible in the mobile first viewport. This part passes. The live title is `Chore Rulebook — clear household rotations`; its description, canonical, social image metadata, language, one h1, and primary focus handling were present on the application routes.

## Findings

### BLOCKING — F-1-1: the earlier manifest MIME finding remains unfixed

- **Location / evidence:** `.factory/handoff.md` records the known gap: “The live manifest is sent as `application/octet-stream`.” A fresh live `HEAD /manifest.webmanifest` still returns `content-type: application/octet-stream`.
- **Why this fails:** the previous handoff explicitly left this defect open. The review instructions require every earlier finding to be confirmed fixed in live code; an unfixed one is blocking again. It also prevents the manifest from being served as its declared web-manifest document type.
- **Concrete fix:** configure the static host to serve `.webmanifest` as `application/manifest+json` (or `application/json`), then add a deployed-header regression check that asserts that type.

### Minor — F-1-2: the designed 404 does not use the required site skeleton or route metadata

- **Location / exact text:** live `/not-a-real-route` returns the styled 404 with h1 “This page has no chore rule” and only “Return to Chore Rulebook.” `public/404.html` has no product header, Privacy or Terms links, footer, meta description, canonical link, favicon, or Open Graph/Twitter metadata.
- **Why this fails:** the route is visually designed and returns HTTP 404, but it is not a consistent product route. The heading is also a metaphor rather than a plain section name, so a visitor who mistyped a URL does not get the standard navigation or complete route metadata.
- **Concrete fix:** give the static 404 a minimal Chore Rulebook header, `Privacy` and `Terms` links, required footer, favicon/canonical/description and social metadata. Replace the h1 with **“Page not found”** and retain the useful sentence “The address may be old or incomplete.”

### Minor — F-1-3: the hero image caption is three information-free slogans

- **Location / exact text:** landing figure caption: “One home. Visible rules. Shared understanding.”
- **Why this fails:** none of the three sentences explains the pictured home or a product action. It violates the plain-words requirement against mood slogans. `.factory/copy-audit.md` incorrectly marks all three as pass.
- **Concrete fix:** replace the caption with **“The sample shows chores, assignments, and household rules on one shared device.”** (13 words), or remove it because the image is decorative context.

### Minor — F-1-4: the footer starts with a generic privacy slogan

- **Location / exact text:** landing footer: “Private by default.”
- **Why this fails:** this is an unsupported mood/marketing line that could describe an unrelated product. The next sentence contains the useful fact.
- **Concrete fix:** delete “Private by default.” and keep **“Your household data stays on this device.”**

### Minor — F-1-5: README uses unexplained implementation jargon for the offline feature

- **Location / exact text:** README Features: “The versioned app shell works offline after the first visit.”
- **Why this fails:** “versioned app shell” is implementation jargon. A visitor needs the outcome, not the caching mechanism.
- **Concrete fix:** use **“The app works offline after the first visit.”** This remains covered by `offline-reload`.

### Minor — F-1-6: README makes an unlisted setup claim and uses unclear terminology

- **Location / exact text:** README Develop: “No environment variables or external services are needed for the free/local workflow.”
- **Why this fails:** this is a user-reliance claim with no entry in `.factory/claims.json`; “free/local workflow” is also an unexplained term.
- **Concrete fix:** either delete it, or add a tagged clean-install test. If retained, rewrite it as **“The free features run without an account or a separate service.”**

## Copy audit

Counts split punctuation-bound words (for example, `it—and` is three words) and treat hyphenated compounds as one. There are no sentences over 22 words. `F-1-3` through `F-1-6` are the flagged rows.

### Landing page

| Copy | Words | Check |
| --- | ---: | --- |
| Chore rules for a shared device | 6 | Pass |
| Know whose turn it is—and why | 7 | Pass |
| For households sharing recurring chores, it rotates clear assignments and records what was done. | 14 | Pass |
| Try it with sample data | 5 | Pass |
| Set up this household | 4 | Pass |
| The sample opens a ready-made household. | 6 | Pass |
| Setup starts your private rulebook. | 5 | Pass |
| Stored on this device | 4 | Pass; `device-local` covers it. |
| Works offline after the first visit | 6 | Pass; `offline-reload` covers it. |
| Free for six chores | 4 | Pass; `six-chore-tier` covers it. |
| A pixel-art cutaway home where glowing routes connect dishes, laundry, plants, and a broom. (image alt) | 14 | Pass |
| One home. | 2 | **F-1-3** |
| Visible rules. | 2 | **F-1-3** |
| Shared understanding. | 2 | **F-1-3** |
| How it works | 3 | Pass |
| Set rules in three steps | 5 | Pass |
| Add people. | 2 | Pass |
| Keep household order and mark anyone away. | 7 | Pass |
| Write chore rules. | 3 | Pass |
| Choose rotation or a fixed owner. | 6 | Pass |
| Record completions. | 2 | Pass |
| See the next assignment and its reason. | 7 | Pass |
| What stays private | 3 | Pass |
| Names, rules, and history remain in browser storage. | 8 | Pass |
| The app has no accounts, ads, analytics, or household-data server. | 10 | Pass; `private-runtime` covers it. |
| Private by default. | 3 | **F-1-4** |
| Your household data stays on this device. | 7 | Pass; `device-local` covers it. |
| Built by Param Factory. | 4 | Pass; required attribution. |
| Original house illustration generated with the factory image model. | 9 | Pass; required provenance. |

### README

| Copy | Words | Check |
| --- | ---: | --- |
| Know whose turn it is—and why. | 7 | Pass |
| Chore Rulebook helps households rotate recurring chores and keep a completion history on one shared device. | 16 | Pass |
| Open the one-click sample at `https://chore-rulebook.sociobot.in/demo`. | 6 | Pass |
| Demo changes use separate storage and never change a real rulebook. | 10 | Pass; `demo-isolation` covers it. |
| Live product: `https://chore-rulebook.sociobot.in` | 3 | Pass |
| Rotations follow household order and skip people marked away. | 8 | Pass; `explain-assignment` covers it. |
| Fixed-owner rules keep the same person responsible. | 6 | Pass; `fixed-owner` covers it. |
| Each assignment includes a plain-language reason. | 6 | Pass; `explain-assignment` covers it. |
| Completion history can be exported as JSON or CSV. | 8 | Pass; export claims cover it. |
| JSON backups can be restored on this device. | 8 | Pass; `json-restore` covers it. |
| The versioned app shell works offline after the first visit. | 9 | **F-1-5** |
| The free rulebook accepts six chores. | 6 | Pass; `six-chore-tier` covers it. |
| A $12 one-time Plus purchase adds unlimited chores and printable QR pairing. | 12 | Pass; Plus claims cover it. |
| Privacy and terms routes at `/privacy` and `/terms` | 8 | Pass |
| Requires Node.js 20 or newer. | 6 | Pass |
| Open the printed local URL. | 5 | Pass |
| No environment variables or external services are needed for the free/local workflow. | 13 | **F-1-6** |
| `npm run build` is the deployment build command. | 8 | Pass |
| It writes the static site to `./dist`, with `dist/index.html` at the root. | 13 | Pass |
| End-to-end tests expect the factory-pinned Playwright 1.58.2 Chromium browser. | 12 | Pass; technical setup instruction. |
| Names, rules, completion history, and notes never leave the device unless the user exports a file or shows a pairing QR. | 21 | Pass; privacy and QR claims cover it. |
| A pairing QR embeds a snapshot in the URL fragment; it does not upload it. | 15 | Pass; `qr-pairing` covers it. |
| License verification sends only the saved license token to `api.sociobot.in`. | 12 | Pass; `license-token-only` covers it. |
| There are no analytics, ads, third-party fonts, or runtime CDNs. | 9 | Pass; `private-runtime` request log covers it. |
| The free rulebook supports six chores with rules, history, and exports. | 11 | Pass; tier/export claims cover it. |
| Household Plus costs $12 once and adds unlimited chores and printable QR pairing. | 12 | Pass; Plus claims cover it. |
| Sociobot/Dodo handles checkout and refunds as merchant of record. | 9 | Pass; legal disclosure. |
| If a refund revokes a license, paid features return to free limits. | 12 | Pass; `license-revocation` covers it. |

Terminology remains otherwise consistent: **rulebook** (saved household), **chore rule** (recurring task and assignment rule), **assignment** (current responsibility), **completion** (recorded finished chore), **demo** (sample workspace), and **Plus license** (paid entitlement).

## Demo, privacy, and claims

The demo passes the functional review. Clicking the first-screen sample action opens `/demo` directly to Cedar House with four realistic chores and four completion records. The first post-click screen is the working Today view, not onboarding. It has the persistent “Demo — sample data, nothing is saved to your rulebook” banner, **Reset demo**, and **Start for real**.

In a live fresh context, creating `Review Home`, entering `/demo`, resetting, and choosing Start for real restored `Review Home`; the real `chore-rulebook` database remained and the `demo:chore-rulebook` database was removed. An offline live reload after worker control showed the demo banner and “Today’s household chores” without errors. The entire demo request log had only `https://chore-rulebook.sociobot.in` requests.

After `npm ci`, all 16 exact commands declared in `.factory/claims.json` passed individually from this sandbox: `offline-reload`, `device-local`, `json-export`, `json-restore`, `csv-export`, `explain-assignment`, `six-chore-tier`, `qr-pairing`, `demo-isolation`, `fixed-owner`, `missed-turn-advance`, `plus-unlimited-chores`, `license-token-only`, `private-runtime`, `plus-purchase`, and `license-revocation`.

## Structure and history

- `/`, `/demo`, `/privacy`, and `/terms` returned 200. Deep-linked view navigation, Back, h1 focus, and the polite route announcement worked.
- The application routes have one h1, `lang=en`, title/description/canonical, OG/Twitter metadata, favicon, apple touch icon, robots, sitemap, CSP, and a non-generic pixel signal identity. No dead application links were found.
- An unknown route returns a designed HTTP 404, but `F-1-2` records its missing skeleton and metadata.
- There are no earlier `.factory/review-*.md` or `.factory/polish-*.md` files. The current `.factory/handoff.md` is the applicable history record. Its only known gap is still live and is re-opened as **F-1-1**.
- The brief does not imply a missing AI step or remote sync: this is deliberately local-first, and it already has JSON/CSV export and printable local pairing. No runtime AI feature or embedded provider key was found.

## What would make this perfect

Serve the manifest with its correct MIME type, make the 404 a complete product route, remove the two landing slogans, and rewrite/register the two README copy problems. Then rerun the live header, demo-isolation, route, and claim checks. Only a zero-finding run can change this verdict to PASS.

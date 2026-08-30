# Adversarial first-read review 3 — Chore Rulebook

- Reviewed: 2026-08-30 UTC
- Live target: <https://chore-rulebook.sociobot.in>
- Source reviewed: `0db510f97a0e52f241d3377327ebe4518406d195`
- Verdict: **PASS**

No finding remains at any severity. The first screen is clear at 390 px and on
desktop, the populated demo works in one click without touching real data, all
16 registered claims pass from a clean clone, all earlier findings remain
fixed, and no unlisted product claim was found.

## Cold first read

Fresh Chromium contexts at 390 × 844 and 1440 × 900 loaded `/` with HTTP 200,
no application console or page errors, no horizontal overflow, and no prior
storage. Before scrolling, the page answered:

- **What it does:** rotates recurring household chores, explains whose turn it
  is, and records completions.
- **For whom:** households that share recurring chores on one device.
- **What to click first:** **Try it with sample data**. The adjacent sentence
  says, **“The sample opens a ready-made household.”**

The supporting copy is **“For households sharing recurring chores, it rotates
clear assignments and records what was done.”** All three facts—**“Stored on
this device,” “Works offline after the first visit,”** and **“Free for six
chores”**—fit in the initial 390 px viewport. This check passes.

## Copy audit

Counts split words joined by an em dash and keep hyphenated compounds, paths,
URLs, and version numbers as one word. Headings, actions, facts, alt text, and
footer statements are included so non-sentence interface copy is also checked.
No item exceeds 22 words. No jargon, banned marketing adjective, inconsistent
term, empty slogan, contextless heading, metaphor heading, or non-result-naming
action was found.

### Landing page

| Copy | Words | Result |
| --- | ---: | --- |
| Chore rules for a shared device | 6 | Pass |
| Know whose turn it is—and why | 7 | Pass |
| For households sharing recurring chores, it rotates clear assignments and records what was done. | 14 | Pass |
| Try it with sample data | 5 | Pass |
| Set up this household | 4 | Pass |
| The sample opens a ready-made household. | 6 | Pass |
| Setup starts your private rulebook. | 5 | Pass |
| Stored on this device | 4 | Pass |
| Works offline after the first visit | 6 | Pass |
| Free for six chores | 4 | Pass |
| A pixel-art cutaway home where glowing routes connect dishes, laundry, plants, and a broom. | 14 | Pass; image alt text |
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
| Names, rules, and history remain in browser storage. | 8 | Pass |
| The app has no accounts, ads, analytics, or household-data server. | 10 | Pass |
| Your household data stays on this device. | 7 | Pass |
| Built by Param Factory. | 4 | Pass |
| Original house illustration generated with the factory image model. | 9 | Pass; provenance |

Navigation labels **Demo**, **Privacy**, and **Terms**, plus the status label
**Device ready**, are concise and unambiguous.

### README

| Copy | Words | Result |
| --- | ---: | --- |
| Chore Rulebook | 2 | Pass; document heading |
| Know whose turn it is—and why. | 7 | Pass |
| Chore Rulebook helps households rotate recurring chores and keep a completion history on one shared device. | 16 | Pass |
| Open the one-click sample at `https://chore-rulebook.sociobot.in/demo`. | 6 | Pass |
| Demo changes use separate storage and never change a real rulebook. | 11 | Pass |
| Live product: `https://chore-rulebook.sociobot.in` | 3 | Pass |
| Features | 1 | Pass; heading |
| Rotations follow household order and skip people marked away. | 9 | Pass |
| Fixed-owner rules keep the same person responsible. | 7 | Pass |
| Each assignment includes a plain-language reason. | 6 | Pass |
| Completion history can be exported as JSON or CSV. | 9 | Pass |
| JSON backups can be restored on this device. | 8 | Pass |
| The app works offline after the first visit. | 8 | Pass |
| The free rulebook accepts six chores. | 6 | Pass |
| A $12 one-time Plus purchase adds unlimited chores and printable QR pairing. | 12 | Pass |
| Privacy and terms routes at `/privacy` and `/terms` | 8 | Pass |
| Develop | 1 | Pass; heading |
| Requires Node.js 20 or newer. | 5 | Pass; development prerequisite |
| Open the printed local URL. | 5 | Pass |
| Test and build | 3 | Pass; heading |
| `npm run build` is the deployment build command. | 8 | Pass |
| It writes the static site to `./dist`, with `dist/index.html` at the root. | 12 | Pass |
| End-to-end tests expect the factory-pinned Playwright 1.58.2 Chromium browser. | 9 | Pass |
| Data and privacy | 3 | Pass; heading |
| Names, rules, completion history, and notes never leave the device unless the user exports a file or shows a pairing QR. | 21 | Pass |
| A pairing QR embeds a snapshot in the URL fragment; it does not upload it. | 15 | Pass |
| License verification sends only the saved license token to `api.sociobot.in`. | 10 | Pass |
| There are no analytics, ads, third-party fonts, or runtime CDNs. | 10 | Pass |
| Household Plus | 2 | Pass; heading |
| The free rulebook supports six chores with rules, history, and exports. | 11 | Pass |
| Household Plus costs $12 once and adds unlimited chores and printable QR pairing. | 13 | Pass |
| Checkout opens through Dodo. | 4 | Pass |
| If a license is revoked, paid features return to free limits. | 11 | Pass |
| Project notes | 2 | Pass; heading |
| Visual system and generated-art provenance | 5 | Pass |
| Demo contract | 2 | Pass |
| Tested claims | 2 | Pass |
| Build/verification handoff | 2 | Pass |
| License: MIT | 2 | Pass |

Terminology is consistent: **rulebook** is the household workspace, **chore
rule** is the recurring task and assignment rule, **assignment** is current
responsibility, **completion** is recorded work, **demo** is the sample
workspace, and **Household Plus** is the paid entitlement.

## Demo and sandbox behavior

The landing action opens `/demo` in one click. Its first screen is the working
Today view for **Cedar House**, already showing four realistic chore
assignments: Clean the bathroom, Wash household towels, Kitchen reset, and
Water the plants. It does not open onboarding.

The persistent banner says **“Demo — sample data, nothing is saved to your
rulebook”** and contains **Reset demo** and **Start for real**. In a fresh live
context, changing Alex from Home to Away and selecting Reset restored Alex to
Home. IndexedDB contained separate `chore-rulebook` and
`demo:chore-rulebook` databases during the demo. Starting for real removed only
the demo database and restored the previously created **Review 3 Real Home**
rulebook. The request log contained only
`https://chore-rulebook.sociobot.in`.

After service-worker control, clearing the HTTP cache, switching the context
offline, and reloading `/demo`, the demo banner, Today heading, sample data, and
offline status still rendered without an application console error. This
confirms both isolation and offline behavior on the deployed site.

## Claims

The clean clone was `/tmp/chore-rulebook-review-3.HJ4sN4` at the exact reviewed
commit. `npm ci` completed with no vulnerabilities. Every command from
`.factory/claims.json` was run separately; command output is in
`/tmp/review3-claim-<id>.log`.

| Claim | Result | Observable check |
| --- | --- | --- |
| `offline-reload` | Pass | Demo reloads after cache clear and offline switch. |
| `device-local` | Pass | Free workflow requests remain same-origin. |
| `json-export` | Pass | JSON contains the household, 3 people, 4 chores, and 4 completions. |
| `json-restore` | Pass | Restored availability survives reload. |
| `csv-export` | Pass | CSV has the header and one row per completion. |
| `explain-assignment` | Pass | Explanation reports household order/fixed ownership and away handling. |
| `six-chore-tier` | Pass | The seventh free chore is stopped with the stated limit. |
| `qr-pairing` | Pass | A nonblank local QR is drawn without an external request. |
| `demo-isolation` | Pass | Demo reset and exit preserve the real household. |
| `fixed-owner` | Pass | Bo remains owner after completion and reload. |
| `missed-turn-advance` | Pass | The explanation reports passed full missed intervals. |
| `plus-unlimited-chores` | Pass | A valid cached license permits and retains a seventh chore. |
| `license-token-only` | Pass | Verification sends one query token, no body, and no household text. |
| `private-runtime` | Pass | No accounts or third-party runtime requests/resources appear. |
| `plus-purchase` | Pass | $12 UI points to Sociobot and receives a Dodo checkout redirect. |
| `license-revocation` | Pass | Revocation removes Plus and restores the six-chore limit. |

The landing page and README claim-like statements map to these entries. The
remaining README statements are development commands, route references, or
asset attribution, each directly checked against the repository. There is no
untested product claim.

## Structure, accessibility, and links

- `/`, `/demo`, every linked `?view=` state, `/privacy`, and `/terms` return
  200. An unknown route returns the designed HTTP 404.
- Every audited page has `lang="en"`, one h1, one main landmark, a description,
  a correct canonical URL, favicon and social metadata. Titles identify the
  current route or app view and stay under 60 characters.
- In-app navigation uses browser history. People → Data → Back restored the
  People URL, title, content, and focus on its h1. Route changes use the polite
  status region defined in source.
- The application routes use the same wordmark and Demo/Privacy/Terms header,
  plus a consistent footer with legal links, Param Factory attribution, and
  build `v1.0.7`. The 404 carries the same skeleton.
- All discovered internal links returned 200. `robots.txt`, `sitemap.xml`, the
  manifest, favicon, Apple icon, and social image returned 200; the manifest
  MIME type is `application/manifest+json`.
- Live axe checks found no serious or critical WCAG 2 A/AA issue on the landing,
  all five populated demo views, Privacy, Terms, or 404. All audited routes fit
  within 390 px. Focus states, reduced-motion CSS, semantic controls, and 44 px
  targets are present.
- The dark pixel-art household signal desk follows `.factory/design.md` through
  its original house art, stepped routes, scan grid, monospace labels, amber
  actions, and cyan signals. It is recognizably product-specific rather than a
  generic SaaS layout.

The full clean-clone `npm run check` also passed: 15 Vitest tests, TypeScript,
the production build, and 68 Playwright tests. `dist/index.html` was produced;
the initial JavaScript is 25.57 kB gzip in total.

## Earlier-finding verification

| Earlier finding | Live confirmation | Source confirmation | Status |
| --- | --- | --- | --- |
| F-1-1 — manifest MIME | `/manifest.webmanifest` is 200 with `application/manifest+json`. | `public/staticwebapp.config.json` maps `.webmanifest` correctly. | Closed |
| F-1-2 — incomplete 404 | Unknown URL returns a styled HTTP 404 with **Page not found**, full navigation, footer, legal links, and metadata. | `public/404.html` contains the complete skeleton and plain heading. | Closed |
| F-1-3 — slogan caption | Live caption states what the sample shows. | `src/main.ts` contains the concrete sample caption. | Closed |
| F-1-4 — footer slogan | **Private by default.** is absent; the device-local fact remains. | The old slogan is absent from source. | Closed |
| F-1-5 — README jargon | README says **“The app works offline after the first visit.”** | The old **“versioned app shell”** wording is absent. | Closed |
| F-1-6 — unlisted setup claim | No unsupported environment/service promise is published. | The old **“free/local workflow”** sentence is absent. | Closed |
| F-2-1 — inconsistent header | Landing, demo, Privacy, Terms, and 404 expose Demo/Privacy/Terms. | `siteNavigation()` is rendered by the shared shell; 404 matches it. | Closed |
| F-2-2 — stale view titles | Each demo view and Back navigation shows its matching title and canonical URL. | `documentTitle()` and `canonicalPath()` derive metadata from the active view. | Closed |
| F-2-3 — refund promise | README, Data, and Terms state only the tested checkout/revocation behavior. | Merchant-of-record/refund-handling copy is absent; claim tests cover the replacement. | Closed |

No item is merely marked fixed: each was checked on the deployed site and in
the current source.

## Missed leverage

No obvious brief-implied capability is missing. The brief specifies a
local-first shared-device tool; JSON backup/restore, CSV history export, and
printable QR pairing already provide the expected transfer paths. Remote sync
would change that privacy model, and AI would not improve the deterministic
assignment job. No decorative AI, embedded provider key, or direct Azure model
call is present.

## Findings

None.

## What would make this perfect

Nothing remains to change in the reviewed scope. Preserve the current
clean-context claim suite, live demo-isolation/offline checks, copy audit, and
route/accessibility regressions for the next release; any new public promise
should receive a matching claim entry before publication.

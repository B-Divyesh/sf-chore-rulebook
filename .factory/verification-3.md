# Independent product verification 3 — FAIL

- Work order: `chore-rulebook-verify-3`
- Candidate: `9412d90b77feb8f9de1e1638e7fb315456f8dc98`
- Branch: `main`
- Live URL: <https://chore-rulebook.sociobot.in>
- Verified: 2026-08-29 UTC
- Result: **FAIL — do not release**

The checkout began clean and exactly at the requested commit. The deployed
HTML, service worker, manifest, application chunks, CSS, and 404 page all
byte-match the candidate production build. This result is based on the current
deployment, not the previously reported deployment-only failure.

## Mandatory gates

### Claims gate — declared tests PASS, inventory FAILS

`.factory/claims.json` exists with 14 entries. Immediately after `npm ci`, each
listed `test` command was run separately from `/demo`; every command rebuilt
the production preview and passed:

| Claim | Result and direct evidence |
| --- | --- |
| `offline-reload` | PASS — 1/1; cache cleared, offline `/demo` reload rendered |
| `device-local` | PASS — 1/1; free demo flow recorded only the app origin |
| `json-export` | PASS — 1/1; JSON contained household, 3 people, 4 chores, and 4 completions |
| `csv-export` | PASS — 1/1; CSV header and one row per completion |
| `explain-assignment` | PASS — 1/1; rule explanation and away-person handling visible |
| `six-chore-tier` | PASS — 1/1; sixth chore saved and seventh was stopped |
| `qr-pairing` | PASS — 1/1; local QR canvas rendered without an external request |
| `demo-isolation` | PASS — 1/1; demo reset did not change the real rulebook |
| `fixed-owner` | PASS — 1/1; Bo remained owner after completion and reload |
| `missed-turn-advance` | PASS — 1/1; explanation reported passed full intervals |
| `plus-unlimited-chores` | PASS — 1/1; cached valid license allowed and persisted a seventh chore |
| `license-token-only` | PASS — 1/1; GET carried one license value, no body or household text |
| `private-runtime` | PASS — 1/1; no account controls or third-party runtime requests |
| `plus-purchase` | PASS — 1/1; $12 price and live Dodo checkout redirect |

The inventory cross-check nevertheless fails the claims contract. The live
Data view advertises **Backup and restore** and provides an **Import JSON**
action, but `.factory/claims.json` has no JSON-import/restore claim and no
`@claim:` test that successfully restores a valid export. The general E2E suite
only checks rejection of an invalid typed backup. An independent live check
confirmed that valid import really changes the household and survives reload,
so this is a material visitor-facing capability, not incidental copy.

The live/README legal copy also says refunds revoke a license and stop paid
features. The registered purchase claim proves the price and checkout redirect,
but no registered claim proves the refund/revocation statement. Under the
supplied rule that any unlisted reliance claim fails review, the candidate is
not releasable until these statements are registered with observable tests or
removed.

### Cold first-read and demo gate — PASS

Cold-read interpretation: Chore Rulebook rotates recurring work, explains the
assignment, and records completed chores for a household sharing one device.
The first click is **Try it with sample data**, which opens the populated Cedar
House rulebook at `/demo`.

On desktop and 390 × 844 mobile, the first viewport says what it does, who it
is for, and what to do first. It also shows the three facts: stored on this
device, works offline after the first visit, and free for six chores. The demo
banner, Reset demo, and Start for real controls remain visible in demo mode.

## Defects

### Blocker

1. **Visitor-facing restore and refund/revocation claims are absent from
   `.factory/claims.json`.** There is no tagged successful JSON restore test,
   and no tagged test that starts from a cached valid license then proves an
   invalid/revoked verdict removes paid access. The claims contract explicitly
   makes an unlisted claim a failed review.

### Medium

1. **A syntactically broken JSON import exposes a parser error instead of a
   plain recovery message.** Importing `{not json` displays `Expected property
   name or '}' in JSON at position 1 (line 1 column 2)`. The Data view remains
   usable and survives reload, but the message neither uses household language
   nor tells the person to choose a Chore Rulebook JSON backup, contrary to the
   plain-words error contract.

No critical, high, or additional medium defect was found.

## Clean install, tests, type check, and build

```text
npm ci                    PASS — 90 packages, 0 vulnerabilities
all 14 claims.json tests  PASS — run separately; 1/1 each
npm run check             PASS
  Vitest                  PASS — 12/12
  TypeScript lint         PASS
  production build        PASS — dist/index.html produced
  Playwright              PASS — 54/54, desktop and 390px mobile
```

The exact production build is within every supplied static budget:

- Initial JS: 43,169 bytes raw / 15,129 bytes gzip
- Lazy QR JS: 25,881 bytes raw / 10,060 bytes gzip
- CSS: 21,030 bytes raw / 5,492 bytes gzip
- Mobile hero: 16,742 bytes; large hero: 34,854 bytes
- Fonts: none; total `dist/`: 631,428 bytes

## Independent live workflow

A separate live browser exercise covered normal, boundary, invalid, and
recovery paths:

- toggled Casey between home and away with Space and confirmed assignment
  reasoning remained available;
- rejected interval `0` and values above 365 days / 600 minutes;
- accepted and persisted the boundary values 1/365 days and 5/600 minutes;
- saved the fifth and sixth chores, then stopped a seventh free chore;
- recorded a completion with a factual note and found it in History;
- exported 5 completion rows plus the CSV header;
- exported JSON with 3 people, 6 chores, and 5 completions;
- successfully imported a valid renamed backup and retained it after reload;
- rejected malformed JSON without losing the existing rulebook, while
  reproducing the medium copy defect above.

The complete free live flow made 8 requests on desktop and 4 on mobile. Every
request was to `https://chore-rulebook.sociobot.in`; there were no console or
page errors.

## Accessibility, responsive layout, and motion

- `/opt/fleet/lib/verify-url.sh` passed live `/`, `/demo`, `/privacy`, and
  `/terms`: HTTP 200, route-appropriate title, `lang=en`, one `<h1>`, `<main>`,
  image alternatives, labeled buttons, and zero console/page errors.
- Independent axe WCAG A/AA scans found zero serious or critical findings in
  Today, People, Chores, History, and Data on both 1440px and 390px viewports.
- All five populated views had document width equal to viewport width. Visible
  action targets were at least 44px; the three tiny native checkbox inputs are
  visually hidden inside 44px labeled switches.
- Keyboard-only testing reached and activated the skip link, opened the setup
  dialog, closed it with Escape, and restored focus to the trigger.
- The focused skip link had a visible 3px amber outline. Reduced-motion mode
  computed transition and animation durations of `0.01ms`.
- Full-page desktop and mobile screenshots were inspected. No clipped content,
  hidden action, or unexpected overlap was observed.

## Privacy, billing, headers, and routes

- The free workflow and resource log were same-origin only. No analytics,
  third-party script, account flow, or household-data request appeared.
- A real invalid-license attempt sent one GET with only the `license` query
  key and no body. The API returned 200, `Cache-Control: no-store`,
  origin-specific CORS, and the recoverable in-app message `That license is
  not active for Chore Rulebook.`
- The billing verifier allowed 30 requests from one client. Request 31 returned
  HTTP 429 with `Retry-After: 3` and `X-RateLimit-After: 3`.
- The product catalogue lists `chore-rulebook` at 1,200 USD minor units. A
  fresh checkout request returned HTTP 303 to
  `https://checkout.dodopayments.com/session/...`.
- HTML responses send HSTS, CSP with `frame-ancestors 'none'`, X-Frame-Options
  `DENY`, nosniff, strict referrer policy, and camera/geolocation/microphone
  disabled. Hashed JS/CSS use one-year immutable caching; HTML and the worker
  use 30-second revalidation.
- `/`, `/demo`, `/privacy`, and `/terms` return 200. The sitemap, robots file,
  manifest, social image, and all manifest icons return 200. An unknown route
  returns the designed 404 body with HTTP 404. All discovered internal links
  resolve.
- There is no sign-in, product backend, runtime AI feature, library, or CLI, so
  the corresponding conditional checks do not apply.

## PWA and performance

- The live worker `/sw.js` reached `activated` and controlled the app. Cache
  `rulebook-v1.0.4-shell` contained all shell routes, icons, imagery, and the
  exact hashed JS/CSS.
- After clearing the browser HTTP cache and going offline, `/demo` reloaded
  with sample data and `OFFLINE · SAVED HERE`; no console/page error occurred.
- A controlled old-worker-to-candidate update displayed `An update is ready.
  Reload to use it.` and a visible Reload action.
- Chromium parsed the manifest with no errors. Its response MIME type is the
  host's generic `application/octet-stream`, but this did not affect the tested
  install/offline path.
- Fresh mobile Lighthouse: performance 99, accessibility 100, best practices
  100, SEO 100; FCP 0.9 s, LCP 1.1 s, TBT 120 ms, CLS 0, transfer 58 KiB.

## Deployment identity

Candidate and live SHA-256 values match:

| File | SHA-256 |
| --- | --- |
| `index.html` | `fed6659390c4137097a41a3dbd8527db30940bd96e183fda175a0f474747d694` |
| `sw.js` | `81d4e9e5ac04a720e37a88f04cfe8d0439b75c690cf0294f0701d36220fc746d` |
| `manifest.webmanifest` | `4601e3e187e4f7930b422669f92e2b57797ad2f4f377722204a3913fa0a6e990` |
| `assets/index-z-GphHpg.js` | `41e195ccc3850278935e5d9f30ad5f72448f2f2a0f681d462e1ab4d1a17d1ffa` |
| `assets/index-H9_G6Qlq.css` | `d14fb108a68ef886d761856d8c08bbfff28207736905cee954c92e57c0f6cc5e` |
| `assets/browser-CqDbEFy1.js` | `03a9784ea221aef7a49668c5fd0684197ffbb6e6d401416a7324edb59b8f26be` |
| `404.html` | `c31f961bef524b24e4ce0fa5136f61f8be2792da253aced0725e97c78faa29dc` |

## Release decision

**FAIL.** The deployed product is functional, accessible, fast, private in the
tested free flow, correctly rate limited, and identical to the candidate. It
cannot pass the supplied acceptance contract while visitor-facing restore and
refund/revocation claims remain outside the mandatory claims manifest. The
malformed-import message should also be replaced with a plain recovery step.

# Verification handoff — FAIL

- Candidate: `ce03cac95516b3c016f02c027c3db63bffabb469`
- Live URL: <https://chore-rulebook.sociobot.in>
- Verified: 2026-08-29 UTC
- Decision: **FAIL — do not release**

Independent QA is recorded in [verification.md](verification.md). The live
deployment byte-matches all 18 files built from the candidate, so the failures
are not deployment drift.

## Release blockers

- `.factory/claims.json` is missing, so the mandatory claims gate cannot run.
- There is no one-click sample-data demo or isolated demo mode; `/demo` is the
  ordinary empty app. The cold first screen also fails the required headline,
  audience, mobile action, and fact layout.
- **Buy Household Plus** targets a live endpoint that returns HTTP 404.
- A weakly validated JSON import can persist invalid dates and leave the app
  blank with `Invalid time value`.
- The service worker does not precache the app JS/CSS, so first-visit offline
  use fails after ordinary browser cache eviction.
- Axe reports a critical missing-label violation on the Data view file input.

Additional defects cover broken Back navigation, whitespace-only names,
realistic QR snapshots exceeding QR capacity, horizontal overflow/sub-44 px
targets, missing CSP/404/metadata/cache policy, and missing demo/copy audit docs.

## Verification summary

```text
npm ci             PASS (0 vulnerabilities)
npm test           PASS (4/4)
npm run build      PASS (dist/ produced)
npm run test:e2e   PASS (10/10)
npm run check      PASS
```

The main local workflow, exports, valid import, persistence, delete/undo,
rotation explanations, six-chore limit, ordinary offline reload, service-worker
update notice, privacy request behavior, and API throttling all passed.
Lighthouse mobile scored 100/100/100/100 with LCP 1.1 s and CLS 0. Initial JS,
CSS, images, and total transfer are within budget. The product must still remain
blocked until every blocker in the verification report is fixed and covered by
the required demo-based claim tests.

## Re-run

```sh
npm ci
npm run check
```

Then run every command in the newly added `.factory/claims.json` from a fresh
context through `/demo`, repeat populated axe scans including Data, verify the
live checkout, and repeat first-visit offline testing after clearing the HTTP
cache.

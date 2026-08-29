# Review handoff — Chore Rulebook review 2

- Work order: `chore-rulebook-review-2`
- Reviewed source: `7bc0ba6bc88d96d8c069656dd6db0f04d2466e20`
- Live target: <https://chore-rulebook.sociobot.in>
- Result: **FAIL — three minor findings; no product code was changed.**

## What was done

- Performed a fresh 390 px and desktop first-read audit of the live site.
- Entered the one-click demo, checked its populated first state, reset/exit
  controls, IndexedDB namespace isolation, same-origin request log, and offline
  reload after service-worker control.
- Read the brief, design thesis, claim manifest, demo contract, README, prior
  review/polish history, handoff, and source.
- Ran every claim command listed in `.factory/claims.json` independently from a
  fresh clone, then ran the full quality gate.
- Checked live route metadata, 404, manifest MIME, internal links, mobile
  overflow, history focus behavior, and prior-finding closure.

## Verification

Fresh clone: `/tmp/chore-rulebook-review-2.PwsAzv`

```sh
npm ci
# each command in .factory/claims.json, separately
npm run check
```

All 16 registered claim commands passed. `npm run check` passed: 15 unit tests,
TypeScript, production build, and 64 Playwright tests. Live demo requests were
same-origin only; demo data remained in `demo:chore-rulebook`, and the real
`chore-rulebook` namespace survived Reset and Start for real. Offline live
`/demo` reload passed after the worker became active.

## Remaining work

See `.factory/review-2.md` for the full evidence and copy audit.

1. **F-2-1:** make the header navigation consistent on landing, demo, legal,
   and 404 routes.
2. **F-2-2:** update `document.title` when a deep-linkable in-app view changes.
3. **F-2-3:** register and prove, or remove, the refund/merchant-of-record
   promise in README and Terms.

No deployment, infrastructure, billing, or product code was modified by this
review.

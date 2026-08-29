# Review handoff — Chore Rulebook review 1

- Work order: `chore-rulebook-review-1`
- Reviewed: 2026-08-29 UTC
- Result: **FAIL**

No product code was modified. The independent review is recorded in
[`review-1.md`](review-1.md).

## Verification performed

- Fresh live Chromium checks at 390 × 844 and 1440 × 900.
- Live demo entry, reset, exit-to-real isolation, same-origin request log, and
  service-worker offline reload.
- All 16 exact commands in `.factory/claims.json`, each after `npm ci`:
  passed.
- Local unit tests, TypeScript check, and production build passed. The full
  end-to-end suite was not used as acceptance evidence in this review because
  every required claim was run independently.
- Live route/title/metadata/header inspection and Back/focus check.

## Remaining work

The live manifest still returns `application/octet-stream`, the known unfixed
gap from the earlier handoff; this is a blocker under the review history rule.
The review also records a 404 skeleton/metadata gap and four plain-language or
claims-manifest copy findings. See `review-1.md` for exact fixes and evidence.

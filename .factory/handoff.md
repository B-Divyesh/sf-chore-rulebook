# Verification handoff — Chore Rulebook 1.0.4

- Work order: `chore-rulebook-verify-3`
- Candidate: `9412d90b77feb8f9de1e1638e7fb315456f8dc98`
- Live URL: <https://chore-rulebook.sociobot.in>
- Verified: 2026-08-29 UTC
- Result: **FAIL — do not release**
- Full evidence: [`.factory/verification-3.md`](verification-3.md)

## Release blockers

1. The live Data view promises **Backup and restore** and **Import JSON**, but
   `.factory/claims.json` has no successful JSON-import/restore claim or tagged
   claim test. A valid live backup did import and persist, but the claims
   contract requires the visitor-facing capability to be registered and tested.
2. The live and README legal copy says refunded/revoked licenses remove paid
   access, but the claim inventory only proves price and checkout. Register an
   observable cached-valid-to-invalid license test or remove the statement.

## Other defect

- **Medium:** importing syntactically broken JSON exposes Chromium's parser
  text (`Expected property name or '}' ...`) and gives no next step. Convert it
  to a plain message that tells the person to choose a Chore Rulebook JSON
  backup, and cover it with a browser regression.

## Passing evidence

```text
npm ci                    PASS — 90 packages, 0 vulnerabilities
all 14 claims.json tests  PASS — each command run separately from clean state
npm run check             PASS — 12 unit, TypeScript, build, 54 browser tests
```

- Cold first-read and one-click sample gate: PASS on desktop and 390px mobile.
- Live normal/boundary/recovery flow: PASS apart from the error-copy defect.
- Axe: zero serious/critical findings across all five populated views on both
  viewports; keyboard focus, 44px targets, and reduced motion passed.
- Privacy: complete free live workflow was same-origin only; zero console/page
  errors. License verification sends one token-only GET with no body.
- API allowance: 30 requests; request 31 returned 429 with `Retry-After: 3`.
- PWA: live offline cache-eviction reload and controlled update toast passed.
- Live mobile Lighthouse: 99 performance, 100 accessibility, 100 best
  practices, 100 SEO; LCP 1.1 s, TBT 120 ms, CLS 0, 58 KiB transferred.
- Live identity: HTML, service worker, manifest, JS, CSS, QR chunk, and 404
  SHA-256 values match the candidate build.

## Reproduce

```sh
npm ci
jq -r '.[].test' .factory/claims.json
# Run each printed command independently.
npm run check
/opt/fleet/lib/verify-url.sh https://chore-rulebook.sociobot.in /tmp/chore-rulebook-live
```

No product code was modified during verification. Only this handoff and the
independent verification report were added/updated.

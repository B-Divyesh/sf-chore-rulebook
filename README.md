# Chore Rulebook

Know whose turn it is—and why. Chore Rulebook helps households rotate recurring
chores and keep a completion history on one shared device.

Open the one-click sample at <https://chore-rulebook.sociobot.in/demo>. Demo
changes use separate storage and never change a real rulebook.

Live product: <https://chore-rulebook.sociobot.in>

## Features

- Rotations follow household order and skip people marked away.
- Fixed-owner rules keep the same person responsible.
- Each assignment includes a plain-language reason.
- Completion history can be exported as JSON or CSV.
- The versioned app shell works offline after the first visit.
- The free rulebook accepts six chores.
- A $12 one-time Plus purchase adds unlimited chores and printable QR pairing.
- Privacy and terms routes at `/privacy` and `/terms`

## Develop

Requires Node.js 20 or newer.

```sh
npm ci
npm run dev
```

Open the printed local URL. No environment variables or external services are
needed for the free/local workflow.

## Test and build

```sh
npm test
npm run build
npm run test:e2e
```

`npm run build` is the deployment build command. It writes the static site to
`./dist`, with `dist/index.html` at the root. End-to-end tests expect the
factory-pinned Playwright 1.58.2 Chromium browser.

## Data and privacy

Names, rules, completion history, and notes never leave the device unless the
user exports a file or shows a pairing QR. A pairing QR embeds a snapshot in the
URL fragment; it does not upload it. License verification sends only the saved
license token to `api.sociobot.in`. There are no analytics, ads, third-party
fonts, or runtime CDNs.

## Household Plus

The free rulebook supports six chores with rules, history, and exports.
Household Plus costs $12 once and adds unlimited chores and printable QR
pairing. Sociobot/Dodo handles checkout and refunds as merchant of record.

## Project notes

- Visual system and generated-art provenance: [`.factory/design.md`](.factory/design.md)
- Demo contract: [`.factory/demo.md`](.factory/demo.md)
- Tested claims: [`.factory/claims.json`](.factory/claims.json)
- Build/verification handoff: [`.factory/handoff.md`](.factory/handoff.md)
- License: MIT

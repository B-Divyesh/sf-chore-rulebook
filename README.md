# Chore Rulebook

Chore Rulebook is an offline-first household utility for recurring chores. It
makes assignment rules inspectable: rotations follow household order, skip
people marked away, recover missed turns explicitly, and explain why each
person is next. Fixed ownership, effort estimates, and a lightweight completion
history cover the cases a flat checklist misses—without points, streaks,
surveillance, chat, or member accounts.

The product is designed for a shared phone, tablet, or household computer. All
household data is stored locally in IndexedDB. JSON/CSV exports and printable QR
snapshot pairing let the household own and move its data.

Live product: <https://chore-rulebook.sociobot.in>

## Features

- Named household members with home/away availability
- Rotating or fixed-owner rules, interval, and estimated effort
- Two explicit missed-turn policies: hold the turn or pass each full interval
- Plain-language “Why this assignment?” explanations
- Completion notes, history, deletion, and undo
- Seven-day estimated-effort overview (informational, never scored)
- JSON backup/restore and CSV history export
- Installable PWA with a versioned offline shell
- Optional Household Plus license through the Sociobot billing API
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

## Paid unlock

The free rulebook supports six chores with all core rules, history, and exports.
Household Plus is a $12 one-time unlock for unlimited chores and printable QR
pairing. Checkout and license verification use the Sociobot contract; no payment
provider is embedded and no product ID is hardcoded.

## Project notes

- Visual system and generated-art provenance: [`.factory/design.md`](.factory/design.md)
- Build/verification handoff: [`.factory/handoff.md`](.factory/handoff.md)
- License: MIT

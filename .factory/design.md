# Chore Rulebook visual thesis

## Direction: the household signal desk

Chore Rulebook uses a **pixel/demoscene language** as a calm domestic control
surface: chunky pixels, stepped route lines, scan-grid texture, monospace data,
and a small amber “house signal” illustration. This fits the product because an
assignment rule should feel inspectable—like following a circuit—not magical or
competitive. The character comes from precise details rather than game rewards.

This is intentionally a single dark treatment. The ink-dark surface gives the
pixel signals a stable, high-contrast field and makes a shared wall tablet feel
like an always-ready household appliance. Every state also has text or an icon;
color never carries meaning alone.

## Tokens

- `ink #0A101C`: page background
- `panel #111C2E`: raised working surface
- `panel-2 #18263B`: active/secondary surface
- `paper #F4F1DF`: primary copy (15.9:1 on ink)
- `mist #AEBBD0`: secondary copy (9.4:1 on ink)
- `amber #FFCC66`: primary action/signal (12.2:1 on ink)
- `amber-ink #241700`: text on amber (12.1:1)
- `cyan #5EE6D0`: due/connected signal (12.0:1 on ink)
- `green #72E0A0`: success
- `warning #FFB86B`: warning
- `danger #FF7E8A`: destructive state
- outlines use `#344966`, never lower-contrast hairlines for controls.

Spacing follows a 4/8px rhythm: 4, 8, 12, 16, 24, 32, 48, 64. Corners are
mostly 2–8px, with 2px borders and occasional 4px offset shadows to keep the
pixel construction visible. Touch targets are at least 44px.

## Typography

- Headings and labels: system monospace (`ui-monospace`, SFMono-Regular,
  Consolas), uppercased only for short signal labels. It evokes rule sheets
  without loading a third-party font.
- Body: system sans (`Inter`-like platform stack: system-ui, Segoe UI, sans-serif)
  at 16px minimum and 1.55 line-height.
- Scale: 16 / 18 / 22 / 30 / clamp(36–60). Tabular figures for dates and effort.

No runtime fonts are fetched; system stacks keep the offline shell fast.

## Interaction grammar

- Primary actions are amber with a dark offset shadow; secondary actions are
  ink/panel buttons with clear borders.
- The “why this person?” explanation expands inline under the assignment so the
  reasoning stays beside the outcome.
- Navigation is a segmented signal rail, not a floating app bar. On 390px it
  scrolls horizontally while the working view stacks to one column.
- Dialogs return focus to their trigger. Destructive deletion names its target.
- Success feedback appears as a quiet live-region toast and as a visible history
  row—never confetti or scoring.

## Motion policy

Only continuity moves: view content fades/translates 6px over 180ms, the active
signal advances once, and toasts enter from the bottom. Nothing loops. Under
`prefers-reduced-motion: reduce`, transitions and transforms are removed and
state changes are instantaneous.

## Original asset plan and provenance

Hero asset: a wide pixel-art cutaway of an ordinary shared home with three
rooms connected by glowing chore-route circuits. It explains that rules connect
people, rooms, and recurring work. It is decorative context, not a claim about
app capability. Product icons and UI marks are hand-authored SVG/CSS pixels.

**Prompt sheet**

- Subject: compact cutaway apartment, laundry basket, dishes, watering can,
  broom, no people
- World/materials: 16-bit demoscene pixel art, dark navy grid, paper labels
  without text, stepped circuit routes
- Light/lens: orthographic wide cutaway, warm window light, crisp hard pixels
- Palette words: midnight ink, amber signal, mint-cyan route, parchment cream
- Negative list: no text, watermark, logo, brands, people, faces, rewards,
  coins, badges, gradients, photorealism, illegible pseudo-letters

Generated with the factory Azure image deployment (`factory-image`) on
2026-08-28 via `/opt/fleet/lib/gen-image.sh`. The exact production prompt is
stored at `assets/src/house-signal.json`. The output is original generated
imagery for this product and is disclosed in the footer. Source PNG is retained
under `assets/src/`; optimized WebP ships in `public/assets/`.

The 1200×630 social preview in `public/assets/chore-rulebook-social.jpg` is a
cropped composition of that same original source image. The Apple touch icon is
a 180px derivative of the hand-authored product icon. No new third-party asset
was introduced during the 1.0.6 polish.

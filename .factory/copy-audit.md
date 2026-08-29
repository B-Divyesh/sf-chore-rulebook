# Landing copy audit

Audited 2026-08-29 after review 1. Counts treat hyphenated terms as one word. No sentence is over 22 words. No banned marketing word appears.

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
| The sample shows chores, assignments, and household rules on one shared device. | 12 | Pass; concrete image context. |
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
| Original house illustration generated with the factory image model. | 9 | Pass |

## Terminology

| Concept | Product term |
| --- | --- |
| The saved household workspace | rulebook |
| A recurring task and assignment method | chore rule |
| A person’s current responsibility | assignment |
| A recorded finished chore | completion |
| Temporary sample workspace | demo |
| Person excluded from rotation | away |
| Paid entitlement already issued | Plus license |

## README review fixes

| Copy | Words | Result |
| --- | ---: | --- |
| The app works offline after the first visit. | 8 | Pass; `offline-reload` covers it. |
| Open the printed local URL. | 5 | Pass; the unlisted setup claim was removed. |
| Checkout opens through Dodo. | 4 | Pass; `plus-purchase` verifies the gateway redirect. |
| If a license is revoked, paid features return to free limits. | 11 | Pass; `license-revocation` covers it. |

## Review 2 billing copy

The untested merchant-of-record and refund-handling promise was removed from the
README, Data view, and Terms. The replacement checkout sentence is covered by
`plus-purchase`; the revocation sentence is covered by `license-revocation`.

| Copy | Words | Result |
| --- | ---: | --- |
| Checkout opens through Dodo. | 4 | Pass; `plus-purchase` follows the checkout redirect. |
| A revoked license returns Plus features to free limits. | 10 | Pass; `license-revocation` asserts the seventh chore is stopped. |

## Catalog description

| Copy | Characters | Result |
| --- | ---: | --- |
| Rotate shared household chores, explain each assignment, and keep a local completion history. | 92 | Pass; verb-first and under 120 characters. |

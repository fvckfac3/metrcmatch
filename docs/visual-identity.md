# MetrcMatch Visual Identity

## Purpose

MetrcMatch is an Oregon-focused reconciliation and compliance workspace. Its visual system should convey **verified operational control** rather than cannabis retail culture, healthcare, or government enforcement. The identity combines restrained evergreen tones, legible operational typography, and a compact reconciliation symbol suitable for both the public product narrative and dense authenticated workflows.

## Logo System

The primary mark is a rounded shield that combines a verification check with a ledger-grid motif. It represents three product ideas at once: protected facility data, matched inventory records, and evidence-ready reconciliation. The mark must remain isolated, upright, and visually simple enough to work at favicon scale.

| Element          | Rule                                                                                                                                                               | Product usage                                           |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| Primary mark     | Use on an evergreen field with clear space of at least one-quarter of the mark width. Do not stretch, rotate, outline, or add a drop shadow.                       | Favicon, header icon, app navigation, compact controls. |
| Typeset wordmark | Set **MetrcMatch** in Manrope ExtraBold, with a tight `-0.055em` tracking treatment. The wordmark is rendered as accessible HTML rather than generated image text. | Header, navigation, product surfaces, documents.        |
| Descriptor       | Set **OREGON OPERATIONS** in DM Mono medium, uppercase, `0.15em` tracking. Keep it secondary and omit it in narrow spaces.                                         | Public landing header and expanded brand lockups.       |
| Support icons    | Use the audit-ready document mark and reconciliation illustration as secondary brand accents, never in place of high-frequency familiar UI controls.               | Marketing modules, status callouts, onboarding.         |

## Palette

| Role              | Color     | Use                                                      |
| ----------------- | --------- | -------------------------------------------------------- |
| Evergreen ink     | `#173F3A` | Primary mark field, headline ink, core actions.          |
| Sage signal       | `#5E8B62` | Success, verified state, restrained accents.             |
| Mint field        | `#E7F0E5` | Soft backgrounds and supporting icon fields.             |
| Off-white         | `#F8FBF6` | Surfaces and light background space.                     |
| Operational amber | `#D6A84D` | Review and warning states, not brand-primary decoration. |

## Managed Assets

| Asset                           | Managed URL                                                  | Intended use                                                                                                     |
| ------------------------------- | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Primary reconciliation mark     | `/manus-storage/metrcmatch-app-icon_b5732b20.png`            | Browser icon, public lockup, authenticated navigation. Final opaque production asset.                            |
| Exploratory transparent variant | `/manus-storage/metrcmatch-brand-mark_e8d2d237.png`          | Retained as an exploration artifact only; do not ship because it contains a visible matte fringe at large scale. |
| Reconciliation illustration     | `/manus-storage/metrcmatch-reconciliation-hero_ff9d09a4.png` | Optional landing or onboarding visual after final visual approval.                                               |
| Audit-ready support icon        | `/manus-storage/metrcmatch-audit-ready-icon_4b216ab5.png`    | Optional audit status and reporting accent after final visual approval.                                          |

## Implementation Notes

The reusable `BrandLockup` and `BrandMark` components centralize production use of the verified opaque primary asset and HTML wordmark. This preserves accessibility, avoids fragile generated logo text, and ensures the lockup stays aligned across public and authenticated surfaces. Supporting visual assets are deliberately reserved for lower-risk decorative placements after their final rendering is verified; familiar Lucide icons remain in high-frequency operational controls.

## Approved Release Scope

The current release ships the verified primary reconciliation mark, browser icon, accessible HTML wordmark, descriptor, and shared palette. The reconciliation illustration and audit-ready support icon remain catalogued but are **not** embedded in live controls until their generated files finish and pass the same lightweight review. This prevents a provisional or placeholder asset from interrupting compliance workflows while retaining the planned asset set for a subsequent visual-polish update.

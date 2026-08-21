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

| Asset                            | Managed URL                                                        | Intended use                                                                                                     |
| -------------------------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| Primary reconciliation mark      | `/manus-storage/metrcmatch-app-icon_b5732b20.png`                  | Browser icon, public lockup, authenticated navigation. Final opaque production asset.                            |
| Exploratory transparent variant  | `/manus-storage/metrcmatch-brand-mark_e8d2d237.png`                | Retained as an exploration artifact only; do not ship because it contains a visible matte fringe at large scale. |
| Reviewed onboarding illustration | `/manus-storage/metrcmatch-onboarding-reconciliation_8b9db974.png` | Active in the Facility & Metrc onboarding panel to reinforce the connect, reconcile, verify journey.             |
| Social-sharing card              | `/manus-storage/metrcmatch-open-graph-card_b35d2757.png`           | Open Graph and X/Twitter large-image preview for public links.                                                   |
| Audit-ready support icon         | `/manus-storage/metrcmatch-audit-ready-icon_4b216ab5.png`          | Optional audit status and reporting accent after final visual approval.                                          |

## Icon Export Set

The production mark has been deterministically exported for common browser, iOS, Android, and store contexts. The web application references the favicon, Apple touch icon, and web manifest variants directly; the complete PNG bundle is available at `/manus-storage/metrcmatch-icon-export-set_a9fdfbbd.zip`.

| Export target    |    Dimensions | Managed URL                                                   |
| ---------------- | ------------: | ------------------------------------------------------------- |
| Browser favicon  |       16 × 16 | `/manus-storage/metrcmatch-favicon-16_01ea0cc4.png`           |
| Browser favicon  |       32 × 32 | `/manus-storage/metrcmatch-favicon-32_3a811441.png`           |
| Browser favicon  |       48 × 48 | `/manus-storage/metrcmatch-favicon-48_2dcb821d.png`           |
| Apple touch icon |     180 × 180 | `/manus-storage/metrcmatch-apple-touch-icon-180_7b2bdc14.png` |
| Android/PWA icon |     192 × 192 | `/manus-storage/metrcmatch-android-chrome-192_15e6dc47.png`   |
| Android/PWA icon |     512 × 512 | `/manus-storage/metrcmatch-android-chrome-512_44dfad61.png`   |
| App-store source | 1,024 × 1,024 | `/manus-storage/metrcmatch-app-store-1024_3a7015c0.png`       |

## Implementation Notes

The reusable `BrandLockup` and `BrandMark` components centralize production use of the verified opaque primary asset and HTML wordmark. This preserves accessibility, avoids fragile generated logo text, and ensures the lockup stays aligned across public and authenticated surfaces. Supporting visual assets are deliberately reserved for lower-risk decorative placements after their final rendering is verified; familiar Lucide icons remain in high-frequency operational controls.

## Approved Release Scope

The current release ships the verified primary reconciliation mark, multi-device browser and app icons, accessible HTML wordmark, descriptor, social-sharing metadata, and shared palette. The reviewed reconciliation illustration is active in the Facility & Metrc onboarding panel, while the audit-ready support icon remains catalogued but is **not** embedded in live controls until it passes the same lightweight review. This keeps the visual system helpful without interrupting compliance workflows.

# Landing-Page Verification Record

## Scope

The public landing page was reviewed after the FAQ teaser and focus-state refinements were added. The review covered the full page at a 1440 × 900 desktop viewport and the hero CTA area at a 375 × 812 mobile viewport.

| Area               | Result                                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Mobile hero layout | The headline, descriptive copy, primary audit CTA, and demo CTA remain readable, vertically ordered, and comfortably tappable.                                                                                                                                                                                                                            |
| Desktop full page  | The complete landing page renders the feature grid, workflow, customer-proof placeholder, FAQ teaser, final CTA, and footer without clipping or contrast loss.                                                                                                                                                                                            |
| Public positioning | The landing page continues to identify MetrcMatch as an Oregon reconciliation workflow and does not present POS connectivity as a current integration.                                                                                                                                                                                                    |
| FAQ coverage       | The FAQ addresses POS status, facility setup, credential/data handling, and the discrepancy workflow using product-accurate wording.                                                                                                                                                                                                                      |
| Keyboard focus     | A Chromium DevTools check pressed Tab through the live landing page and verified this sequence: MetrcMatch home, Workflow, Capabilities, Customer proof, FAQ, Sign in, Claim free audit, Claim Your 14-Day Free Audit, and Schedule a Live Demo. A Vitest guard also protects document-order header links, focus styles, CTAs, and the accordion trigger. |

The interactive billing/pricing routes were separately reviewed during the subscription implementation. The public pricing experience renders with legible Starter, Growth, and Enterprise plan cards at both desktop and mobile sizes.

The repeatable live-browser check is available as `node scripts/verify-landing-keyboard.mjs`. It launches an isolated headless Chromium session against the local development server and fails when the first nine focused controls differ from the verified sequence above.

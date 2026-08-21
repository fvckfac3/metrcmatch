# Privacy and Contact Flow Verification

## Scope

This record covers the public cookie-consent banner, Privacy Policy link, contact-request form, public `/contact` route, and the direct legal-contact details added for Rocky Hayes.

| Verification area | Result |
| --- | --- |
| Cookie preference | An isolated Chromium session confirmed that the banner appears for a new visitor, the **Accept** action stores `metrcmatch-cookie-consent-v1=accepted`, and the banner dismisses. |
| Privacy link | The consent banner links directly to `/privacy`; the public footer and trial flow also retain Terms and Privacy links. |
| Contact page | The `/contact` route renders the privacy/general request selector, email field, message field, consent checkbox, and Privacy Policy link. |
| Submission validation | Route tests cover normalized privacy requests, incomplete general inquiry rejection, honeypot suppression, and successful persistence receipts. |
| Request persistence | The reviewed additive migration creates the independent `contactRequests` table with request type, contact fields, subject, message, status, and creation timestamp. |
| Legal contact | The Terms and Privacy pages identify Rocky Hayes and link to `hayesrocky64@gmail.com` and the public contact form for requests and notices. |

## Repeatable checks

```bash
pnpm check
pnpm test
pnpm build
node scripts/verify-privacy-contact-flow.mjs
```

The browser verification requires the local development server to be available at `http://127.0.0.1:3000`.

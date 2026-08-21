import { ArrowLeft, LockKeyhole } from "lucide-react";
import { Link } from "wouter";

export default function Privacy() {
  return (
    <main className="min-h-screen bg-[#f3f7f0] text-[#173f3a]">
      <header className="border-b border-[#dce8dc] bg-[#f8fbf6]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-between px-5 py-5 sm:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-md text-sm font-semibold text-[#356e45] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to MetrcMatch
          </Link>
          <span className="mono-meta text-xs font-bold uppercase tracking-[0.14em] text-[#718178]">
            Privacy
          </span>
        </div>
      </header>
      <article className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="rounded-[2rem] border border-[#d3e1d2] bg-white/85 p-7 shadow-[0_20px_45px_rgba(23,63,58,0.06)] sm:p-12">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e5f2e3] text-[#356e45]">
              <LockKeyhole className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#356e45]">MetrcMatch</p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
                Privacy Policy
              </h1>
              <p className="mt-4 text-sm text-[#61766a]">
                Effective date: August 17, 2026
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-[#f0d99c] bg-[#fff8e8] p-5 text-sm leading-6 text-[#725d28]">
            <strong>Draft for legal review.</strong> This policy is a working
            product draft, not legal advice. Before public launch, the
            MetrcMatch operator, Rocky Hayes, should have qualified counsel
            confirm applicable laws, governing terms, retention practices, and
            any required notices or consent mechanisms.
          </div>

          <div className="legal-copy mt-10 space-y-9 text-[0.95rem] leading-7 text-[#52685c]">
            <section>
              <h2>1. Scope</h2>
              <p>
                This Privacy Policy explains how MetrcMatch handles information
                when you visit the website, create an account, use a facility
                workspace, connect authorized external services, start a trial,
                or manage a subscription. The terms &quot;we,&quot;
                &quot;us,&quot; and &quot;our&quot; refer to Rocky Hayes, the
                MetrcMatch operator.
              </p>
            </section>

            <section>
              <h2>2. Information we collect</h2>
              <p>Depending on how you use the Service, we process:</p>
              <ul>
                <li>
                  Account information, such as name, email address, login
                  method, and role.
                </li>
                <li>
                  Facility information, including facility name, workspace
                  membership, and configuration.
                </li>
                <li>
                  Operational data, including synced inventory, sales and test
                  information, physical logs, discrepancy records, notes,
                  reports, and timestamps.
                </li>
                <li>
                  Integration information, including encrypted Metrc connection
                  credentials and sync-status metadata.
                </li>
                <li>
                  Billing information, including Stripe customer, subscription,
                  plan, trial, and billing-period identifiers. Card information
                  is handled by Stripe rather than stored by MetrcMatch.
                </li>
                <li>
                  Technical information necessary to operate the Service,
                  including session cookies, request metadata, security events,
                  and application diagnostics.
                </li>
              </ul>
            </section>

            <section>
              <h2>3. How we use information</h2>
              <p>
                We use information to authenticate users, provide facility
                workspaces, synchronize authorized records, create logs and
                reports, detect discrepancies, process subscriptions, provide
                support, secure and improve the Service, meet legal obligations,
                and communicate material service or account information. We do
                not use facility operational data to make decisions on your
                behalf about regulatory compliance.
              </p>
            </section>

            <section>
              <h2>4. How information is shared</h2>
              <p>
                We share information only as needed to operate the Service,
                including with infrastructure providers, authentication
                services, Stripe for billing, Metrc when you authorize a
                connection, and Resend if your facility enables alert-email
                delivery. We may also disclose information when required by law,
                to protect the rights and safety of users or the Service, or in
                connection with a corporate transaction subject to applicable
                safeguards. We do not sell facility operational data for
                third-party advertising.
              </p>
            </section>

            <section>
              <h2>5. Security</h2>
              <p>
                We apply reasonable administrative, technical, and
                organizational safeguards designed to protect information. Metrc
                connection credentials are encrypted before persistence, and
                access to operational data is scoped to the signed-in facility.
                No security measure is absolute; you are responsible for
                securing your own account credentials and authorized devices.
              </p>
            </section>

            <section>
              <h2>6. Retention</h2>
              <p>
                We retain information for as long as reasonably necessary to
                provide the Service, maintain records, resolve disputes, enforce
                agreements, and satisfy legal obligations. Retention periods may
                vary by data type, subscription status, and applicable
                requirements. We periodically review stored information and
                delete or de-identify it when it is no longer needed for these
                purposes, subject to legal, security, and dispute-resolution
                obligations.
              </p>
            </section>

            <section>
              <h2>7. Your choices and requests</h2>
              <p>
                You can review and update certain account and facility details
                through the Service. Depending on applicable law, you may have
                rights to request access, correction, deletion, or restriction
                of personal information. Submit a request through the{" "}
                <Link href="/contact">Contact page</Link> or email{" "}
                <a href="mailto:hayesrocky64@gmail.com">
                  hayesrocky64@gmail.com
                </a>
                . We may request information to verify your identity and
                authority before responding.
              </p>
            </section>

            <section>
              <h2>8. Cookies and similar technologies</h2>
              <p>
                The Service uses session and security cookies required for
                authentication and reliable operation. If optional analytics or
                advertising technologies are introduced, the operator must
                update this policy and provide any notices or choices required
                by law.
              </p>
            </section>

            <section>
              <h2>9. Changes and contact</h2>
              <p>
                We may update this policy to reflect changes in the Service or
                applicable requirements. Material changes will be communicated
                as required by law. For privacy questions, requests, and
                notices, contact Rocky Hayes at{" "}
                <a href="mailto:hayesrocky64@gmail.com">
                  hayesrocky64@gmail.com
                </a>{" "}
                or use the <Link href="/contact">Contact page</Link>.
              </p>
              <p>
                Your use of the Service is also governed by the{" "}
                <Link href="/terms">Terms of Service</Link>.
              </p>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}

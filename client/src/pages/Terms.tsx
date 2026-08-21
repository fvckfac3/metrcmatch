import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "wouter";

export default function Terms() {
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
            Legal
          </span>
        </div>
      </header>
      <article className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="rounded-[2rem] border border-[#d3e1d2] bg-white/85 p-7 shadow-[0_20px_45px_rgba(23,63,58,0.06)] sm:p-12">
          <div className="flex items-start gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#e5f2e3] text-[#356e45]">
              <FileText className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-[#356e45]">MetrcMatch</p>
              <h1 className="mt-2 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
                Terms of Service
              </h1>
              <p className="mt-4 text-sm text-[#61766a]">
                Effective date: August 17, 2026
              </p>
            </div>
          </div>

          <div className="mt-10 rounded-2xl border border-[#f0d99c] bg-[#fff8e8] p-5 text-sm leading-6 text-[#725d28]">
            <strong>Draft for legal review.</strong> These terms are a working
            product draft, not legal advice. Before public launch, the
            MetrcMatch operator, Rocky Hayes, should have qualified counsel
            confirm governing law, dispute terms, and any industry-specific
            obligations.
          </div>

          <div className="legal-copy mt-10 space-y-9 text-[0.95rem] leading-7 text-[#52685c]">
            <section>
              <h2>1. Agreement and eligibility</h2>
              <p>
                These Terms of Service govern access to and use of the
                MetrcMatch website, workspace, integrations, reports, and
                related services (the Service). By using the Service, you agree
                to these terms for yourself and any organization you represent.
                You confirm that you are authorized to bind that organization.
                The Service is intended for authorized personnel of cannabis
                businesses and their approved advisors.
              </p>
            </section>

            <section>
              <h2>2. Accounts and facility access</h2>
              <p>
                You are responsible for providing accurate account and facility
                details, maintaining the confidentiality of credentials, and
                ensuring that every user in your workspace is authorized. You
                must notify the operator promptly of suspected unauthorized
                access. The operator may suspend access that presents a
                security, legal, operational, or payment risk.
              </p>
            </section>

            <section>
              <h2>3. Operational records and external services</h2>
              <p>
                MetrcMatch supports reconciliation by comparing synchronized
                records with facility-entered physical logs. It does not replace
                your obligation to validate data, investigate variances,
                maintain source records, or complete required reporting. You
                remain responsible for the accuracy, completeness, legality, and
                timeliness of all information and actions associated with your
                facility.
              </p>
              <p>
                You may connect only external systems that you are authorized to
                access. Metrc and other third-party services are independent of
                MetrcMatch, and their availability, policies, data quality, and
                API behavior remain outside the operator's control.
              </p>
            </section>

            <section>
              <h2>4. Trials, subscriptions, and payments</h2>
              <p>
                Operational features require an active subscription or active
                trial. A card-required 14-day trial may be offered for eligible
                plans; the first recurring charge occurs when the trial ends
                unless canceled beforehand. Stripe processes checkout,
                subscription management, invoices, and cancellation through its
                hosted services. You authorize applicable recurring charges
                until cancellation, subject to applicable law.
              </p>
              <p>
                Prices, trial availability, and plan features may change with
                prospective notice. You are responsible for applicable taxes.
                The operator may suspend paid access after a failed payment,
                expired trial, chargeback, or material breach of these terms.
              </p>
            </section>

            <section>
              <h2>5. Acceptable use and ownership</h2>
              <p>
                You may use the Service only for your internal business
                operations and in compliance with applicable law. You must not
                interfere with the Service, introduce malicious code, bypass
                access controls, scrape or resell the Service, or reverse
                engineer it except where non-waivable law permits it. The
                Service, software, documentation, design, and related
                intellectual property remain owned by the MetrcMatch operator
                and its licensors. You retain rights in the data you provide.
              </p>
            </section>

            <section>
              <h2>6. Privacy, confidentiality, and disclaimers</h2>
              <p>
                Each party will protect the other party's non-public
                confidential information using reasonable care and use it only
                to provide or use the Service. Our collection and handling of
                personal information is described in the{" "}
                <Link href="/privacy">Privacy Policy</Link>.
              </p>
              <p>
                To the maximum extent permitted by law, the Service is provided
                on an &quot;as is&quot; and &quot;as available&quot; basis
                without warranties of any kind. MetrcMatch does not provide
                legal, regulatory, accounting, or compliance advice. Each
                facility remains solely responsible for its own compliance
                decisions, records, and reporting obligations.
              </p>
            </section>

            <section>
              <h2>7. Limitation, termination, and contact</h2>
              <p>
                To the maximum extent permitted by law, Rocky Hayes, the
                MetrcMatch operator, and its licensors will not be liable for
                indirect, incidental, special, consequential, or punitive
                damages, or for lost profits, data, goodwill, or business
                interruption. These terms remain effective until terminated. The
                operator may suspend or terminate access for breach, security
                risk, nonpayment, or as required by law. Submit questions,
                notices, and rights requests through the{" "}
                <Link href="/contact">Contact page</Link> or email{" "}
                <a href="mailto:hayesrocky64@gmail.com">
                  hayesrocky64@gmail.com
                </a>
                , attention Rocky Hayes.
              </p>
            </section>
          </div>
        </div>
      </article>
    </main>
  );
}

import { ArrowLeft, CheckCircle2, Mail, Send } from "lucide-react";
import { FormEvent, useEffect, useRef, useState } from "react";
import { Link } from "wouter";

type RequestType = "privacy" | "general";

const initialForm = {
  requestType: "privacy" as RequestType,
  name: "",
  email: "",
  subject: "",
  message: "",
  consent: false,
  website: "",
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<{ id: number } | null>(null);
  const successHeadingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (receipt) successHeadingRef.current?.focus();
  }, [receipt]);

  const update = <K extends keyof typeof initialForm>(
    key: K,
    value: (typeof initialForm)[K]
  ) => setForm(current => ({ ...current, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        id?: number;
      };
      if (!response.ok)
        throw new Error(data.error ?? "Unable to submit your request.");
      const requestId = data.id;
      if (typeof requestId !== "number" || !Number.isSafeInteger(requestId))
        throw new Error(
          "Your request was received but no reference was returned."
        );
      setReceipt({ id: requestId });
      setForm(initialForm);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to submit your request."
      );
    } finally {
      setBusy(false);
    }
  };

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
            Contact
          </span>
        </div>
      </header>
      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="pt-2">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e5f2e3] text-[#356e45]">
            <Mail className="h-5 w-5" />
          </span>
          <p className="mt-6 text-sm font-bold text-[#356e45]">
            Reach MetrcMatch
          </p>
          <h1 className="mt-3 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
            Privacy requests and general inquiries.
          </h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-[#61766a]">
            Submit a privacy request or an operational question. Rocky Hayes
            reviews requests at{" "}
            <a
              href="mailto:hayesrocky64@gmail.com"
              className="font-semibold text-[#356e45] underline underline-offset-2"
            >
              hayesrocky64@gmail.com
            </a>
            .
          </p>
          <p className="mt-8 max-w-md rounded-2xl border border-[#d3e1d2] bg-white/70 p-4 text-xs leading-5 text-[#61766a]">
            Do not include passwords, Metrc API keys, payment-card information,
            or other unnecessary sensitive information in this form.
          </p>
        </section>

        <section className="rounded-[2rem] border border-[#d3e1d2] bg-white/90 p-6 shadow-[0_20px_45px_rgba(23,63,58,0.06)] sm:p-9">
          {receipt ? (
            <div
              role="status"
              aria-live="polite"
              className="contact-success-reveal py-10 text-center"
            >
              <div className="contact-success-orbit relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-[#e6f4e5] text-[#356e45]">
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full border-2 border-[#78a77b]/45"
                />
                <CheckCircle2 className="relative h-11 w-11" />
              </div>
              <p className="mono-meta mt-6 text-[11px] font-bold uppercase tracking-[0.14em] text-[#5e8b62]">
                Submission complete
              </p>
              <h2
                ref={successHeadingRef}
                tabIndex={-1}
                className="mt-2 text-2xl font-bold outline-none"
              >
                Your request is safely in the queue.
              </h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-[#61766a]">
                Request #{receipt.id} was received. Rocky Hayes will use the
                contact details you provided to respond.
              </p>
              <button
                onClick={() => setReceipt(null)}
                className="mt-7 rounded-xl bg-[#173f3a] px-4 py-2.5 text-sm font-bold text-white hover:bg-[#0e2f2b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
              >
                Submit another request
              </button>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-5">
              <div>
                <label htmlFor="requestType" className="text-sm font-bold">
                  Request type
                </label>
                <select
                  id="requestType"
                  value={form.requestType}
                  onChange={event =>
                    update("requestType", event.target.value as RequestType)
                  }
                  className="mt-2 h-11 w-full rounded-xl border border-[#c8d7c8] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e8b62]"
                >
                  <option value="privacy">Privacy request</option>
                  <option value="general">General inquiry</option>
                </select>
              </div>
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="text-sm font-bold">
                    Name
                  </label>
                  <input
                    id="name"
                    value={form.name}
                    onChange={event => update("name", event.target.value)}
                    maxLength={120}
                    autoComplete="name"
                    className="mt-2 h-11 w-full rounded-xl border border-[#c8d7c8] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e8b62]"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="text-sm font-bold">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={event => update("email", event.target.value)}
                    maxLength={320}
                    autoComplete="email"
                    className="mt-2 h-11 w-full rounded-xl border border-[#c8d7c8] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e8b62]"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="subject" className="text-sm font-bold">
                  Subject{" "}
                  {form.requestType === "general" ? "(required)" : "(optional)"}
                </label>
                <input
                  id="subject"
                  required={form.requestType === "general"}
                  value={form.subject}
                  onChange={event => update("subject", event.target.value)}
                  maxLength={255}
                  className="mt-2 h-11 w-full rounded-xl border border-[#c8d7c8] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e8b62]"
                />
              </div>
              <div>
                <label htmlFor="message" className="text-sm font-bold">
                  Message
                </label>
                <textarea
                  id="message"
                  required
                  minLength={20}
                  maxLength={4000}
                  value={form.message}
                  onChange={event => update("message", event.target.value)}
                  rows={7}
                  className="mt-2 w-full rounded-xl border border-[#c8d7c8] bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#5e8b62]"
                />
              </div>
              <input
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={form.website}
                onChange={event => update("website", event.target.value)}
                className="absolute -left-[10000px] h-px w-px overflow-hidden"
              />
              <label className="flex cursor-pointer gap-3 text-xs leading-5 text-[#52685c]">
                <input
                  type="checkbox"
                  checked={form.consent}
                  onChange={event => update("consent", event.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-[#9eb69f] accent-[#173f3a]"
                />
                <span>
                  I agree that MetrcMatch may use the information in this
                  request to respond to me, as described in the{" "}
                  <Link
                    href="/privacy"
                    className="font-semibold text-[#356e45] underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </span>
              </label>
              {error && (
                <p role="alert" className="text-sm font-medium text-[#a4372c]">
                  {error}
                </p>
              )}
              <button
                type="submit"
                disabled={busy}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-[#173f3a] px-5 text-sm font-bold text-white hover:bg-[#0e2f2b] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
              >
                <Send className="mr-2 h-4 w-4" />
                {busy ? "Submitting…" : "Submit request"}
              </button>
            </form>
          )}
        </section>
      </div>
    </main>
  );
}

import { useAuth } from "@/_core/hooks/useAuth";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { startLogin } from "@/const";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  Layers3,
  LockKeyhole,
  SearchCheck,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

const features = [
  {
    icon: SearchCheck,
    title: "Instant discrepancy spotting",
    description:
      "Compare the latest Metrc package inventory with recorded physical counts and surface variances for manager review.",
  },
  {
    icon: Layers3,
    title: "Automated batch reconciliation",
    description:
      "Bring hundreds of active packages into a single manager workflow instead of chasing individual spreadsheets.",
  },
  {
    icon: FileCheck2,
    title: "Audit-ready logs",
    description:
      "Create timestamped physical logs and reconciliation reports that preserve the discrepancy context and resolution notes.",
  },
  {
    icon: ShieldCheck,
    title: "Direct Metrc connection",
    description:
      "Connect Oregon Metrc credentials securely. POS connector support is planned and is not represented as live functionality.",
  },
];

const workflow = [
  [
    "01",
    "Connect",
    "Securely connect the facility’s Oregon Metrc credentials.",
  ],
  [
    "02",
    "Reconcile",
    "Sync active packages, record physical reality, and review variances.",
  ],
  [
    "03",
    "Evidence",
    "Document resolutions and export a clear reconciliation record.",
  ],
];

const faqItems = [
  {
    question: "Which point-of-sale systems does MetrcMatch support?",
    answer:
      "MetrcMatch currently connects directly to Oregon Metrc. POS connector support is planned and is not presented as a live integration until it is available.",
  },
  {
    question: "How does setup work for an Oregon facility?",
    answer:
      "A manager creates the facility workspace, enters the facility’s Metrc connection details, runs a connection check, and syncs available package data before recording physical counts and exceptions.",
  },
  {
    question: "How is facility and Metrc data handled?",
    answer:
      "Metrc connection credentials are encrypted before storage, and workspace actions are scoped to the signed-in facility. Facility staff remain responsible for validating records and completing required reporting.",
  },
  {
    question: "What happens when Metrc and a physical count differ?",
    answer:
      "MetrcMatch compares the latest synced quantity with the latest physical count and flags a discrepancy when the variance exceeds five units or five percent. Managers can log likely causes, investigate, resolve, and export reconciliation evidence.",
  },
];

export default function Landing() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();
  const openWorkspace = () => {
    if (user) setLocation("/workspace");
    else startLogin();
  };
  const requestDemo = () =>
    toast.info(
      "Live demo scheduling is being finalized. Use the free audit flow to enter the workspace today."
    );

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f3f7f0] text-[#173f3a]">
      <header className="sticky top-0 z-50 border-b border-[#dce8dc]/80 bg-[#f8fbf6]/88 backdrop-blur-xl">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-5 sm:px-8">
          <button
            onClick={() => setLocation("/")}
            aria-label="MetrcMatch home"
            className="flex items-center gap-3 rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
          >
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#173f3a] text-white shadow-[0_8px_20px_rgba(23,63,58,0.18)]">
              <ShieldCheck className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-base font-extrabold tracking-tight">
                MetrcMatch
              </span>
              <span className="mono-meta block text-[10px] uppercase tracking-[0.15em] text-[#829188]">
                Oregon operations
              </span>
            </span>
          </button>
          <nav className="hidden items-center gap-7 text-sm font-semibold text-[#5b6d63] md:flex">
            <a
              href="#how-it-works"
              className="rounded-md hover:text-[#173f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
            >
              Workflow
            </a>
            <a
              href="#features"
              className="rounded-md hover:text-[#173f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
            >
              Capabilities
            </a>
            <a
              href="#proof"
              className="rounded-md hover:text-[#173f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
            >
              Customer proof
            </a>
            <a
              href="#faq"
              className="rounded-md hover:text-[#173f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
            >
              FAQ
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={openWorkspace}
              disabled={loading}
              className="hidden text-[#205b35] hover:bg-[#e8f2e6] sm:inline-flex"
            >
              {user ? "Open workspace" : "Sign in"}
            </Button>
            <Button
              onClick={openWorkspace}
              disabled={loading}
              className="h-10 rounded-xl bg-[#173f3a] px-4 text-sm shadow-[0_8px_20px_rgba(23,63,58,0.16)] hover:bg-[#0e2f2b]"
            >
              {user ? "Go to workspace" : "Claim free audit"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="relative isolate overflow-hidden">
          <div
            aria-hidden
            className="ambient-grid absolute inset-0 opacity-90"
          />
          <div
            aria-hidden
            className="absolute left-[6%] top-16 h-64 w-64 rounded-full bg-[#d1ebcd]/65 blur-3xl"
          />
          <div
            aria-hidden
            className="absolute -right-16 top-24 h-80 w-80 rounded-full border border-[#a6d6a5]/45 shadow-[0_0_0_36px_rgba(166,214,165,0.13),0_0_0_72px_rgba(166,214,165,0.07)]"
          />
          <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.04fr_0.96fr] lg:items-center lg:py-28">
            <div className="motion-rise">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#bdd7bc] bg-[#f8fdf6] px-3 py-1.5 text-xs font-bold text-[#356e45] shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                Metrc reconciliation, made operational
              </div>
              <h1 className="mt-6 max-w-3xl text-5xl font-extrabold tracking-[-0.055em] text-[#173f3a] sm:text-6xl lg:text-7xl">
                Zero Metrc Discrepancies.
                <br />
                <span className="text-[#4d8b59]">Zero Compliance Stress.</span>
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-[#52685c]">
                MetrcMatch gives Oregon cannabis operators a focused workspace
                for reconciling Metrc package records with logged physical
                reality, prioritizing discrepancies, and creating audit-ready
                reconciliation evidence.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={openWorkspace}
                  disabled={loading}
                  size="lg"
                  className="h-13 rounded-2xl bg-[#173f3a] px-6 text-base shadow-[0_14px_30px_rgba(23,63,58,0.2)] hover:bg-[#0e2f2b]"
                >
                  <BadgeCheck className="mr-2 h-5 w-5" />
                  Claim Your 14-Day Free Audit
                </Button>
                <Button
                  onClick={requestDemo}
                  variant="outline"
                  size="lg"
                  className="h-13 rounded-2xl border-[#a5c3a5] bg-white/70 px-6 text-base text-[#205b35] hover:bg-white"
                >
                  <BarChart3 className="mr-2 h-5 w-5" />
                  Schedule a Live Demo
                </Button>
              </div>
              <p className="mt-4 flex items-center gap-2 text-sm text-[#708178]">
                <LockKeyhole className="h-4 w-4 text-[#5e8b62]" />
                Secure facility access · System-generated timestamps ·
                Oregon-focused workflow
              </p>
            </div>
            <div className="motion-rise motion-delay-2 relative mx-auto w-full max-w-xl">
              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-[#d6edd3] via-transparent to-[#d8eae0] blur-2xl" />
              <div className="command-surface relative overflow-hidden rounded-[2rem] border border-white/90 bg-[#fbfef9]/90 p-5 shadow-[0_28px_70px_rgba(23,63,58,0.14)] sm:p-7">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="mono-meta text-[10px] font-bold uppercase tracking-[0.16em] text-[#78917c]">
                      Live reconciliation view
                    </p>
                    <h2 className="mt-1 text-xl font-bold">
                      Manager control center
                    </h2>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#dff0de] text-[#356e45]">
                    <ClipboardCheck className="h-5 w-5" />
                  </span>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  <div className="rounded-2xl bg-[#173f3a] p-4 text-white">
                    <p className="mono-meta text-[10px] uppercase tracking-[0.12em] text-[#b9d9bb]">
                      Risk
                    </p>
                    <p className="mt-2 text-2xl font-bold">Ready</p>
                    <p className="mt-1 text-xs text-[#d7e8d8]">
                      after latest sync
                    </p>
                  </div>
                  <div className="rounded-2xl border border-[#dce8dc] bg-white/85 p-4">
                    <p className="mono-meta text-[10px] uppercase tracking-[0.12em] text-[#829188]">
                      Packages
                    </p>
                    <p className="mt-2 text-2xl font-bold">Sync</p>
                    <p className="mt-1 text-xs text-[#718178]">from Metrc</p>
                  </div>
                  <div className="rounded-2xl border border-[#f1deb1] bg-[#fff7e6] p-4">
                    <p className="mono-meta text-[10px] uppercase tracking-[0.12em] text-[#9a7a31]">
                      Review
                    </p>
                    <p className="mt-2 text-2xl font-bold">Now</p>
                    <p className="mt-1 text-xs text-[#8f7947]">when flagged</p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl border border-[#dce8dc] bg-white/90 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-bold">
                        Reconciliation evidence
                      </p>
                      <p className="mt-1 text-xs text-[#728178]">
                        Metrc quantity, physical count, cause, and resolution
                        context.
                      </p>
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-[#4d8b59]" />
                  </div>
                  <div className="mt-4 h-2 rounded-full bg-[#e8f0e7]">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#4d8b59] to-[#9ac995]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-bold text-[#356e45]">
              Designed for the reconciliation moment
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
              Clarity when the details matter.
            </h2>
            <p className="mt-4 text-base leading-7 text-[#61766a]">
              A calm, traceable workflow for managers who need to move from a
              record mismatch to a documented resolution without losing context.
            </p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <>
              {features.map((feature, index) => (
                <article
                  key={feature.title}
                  className={`surface-lift motion-rise motion-delay-${Math.min(index + 1, 4)} rounded-3xl border border-[#dce8dc] bg-white/80 p-6 shadow-[0_12px_28px_rgba(23,63,58,0.045)]`}
                >
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-[#e5f2e3] text-[#356e45]">
                    <feature.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-xl font-bold tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-[#63776b]">
                    {feature.description}
                  </p>
                </article>
              ))}
            </>
          </div>
        </section>

        <section
          id="how-it-works"
          className="border-y border-[#d9e6d8] bg-[#eaf3e8]"
        >
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-bold text-[#356e45]">
                  A simpler operating rhythm
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
                  From state records to a defensible workpaper.
                </h2>
              </div>
              <p className="max-w-md text-sm leading-6 text-[#5e7363]">
                MetrcMatch supports reconciliation activity. Facility staff
                remain responsible for validating records and completing
                required regulatory reporting.
              </p>
            </div>
            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {workflow.map(([number, title, description]) => (
                <article
                  key={number}
                  className="rounded-3xl border border-white/80 bg-white/70 p-6 shadow-[0_10px_22px_rgba(23,63,58,0.035)]"
                >
                  <span className="mono-meta text-xs font-bold text-[#5e8b62]">
                    {number}
                  </span>
                  <h3 className="mt-8 text-xl font-bold">{title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#62766a]">
                    {description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="proof" className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
          <div className="rounded-[2rem] border border-[#cfe2cf] bg-white/75 p-7 shadow-[0_20px_45px_rgba(23,63,58,0.06)] sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
              <div>
                <p className="text-sm font-bold text-[#356e45]">
                  Customer proof
                </p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em]">
                  Evidence belongs here, not invented claims.
                </h2>
                <p className="mt-4 text-sm leading-6 text-[#63776b]">
                  This section is intentionally reserved for approved customer
                  case studies, verified testimonials, and attributable
                  outcomes. Add only evidence your team has permission to
                  publish.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  "Verified operator story",
                  "Approved audit outcome",
                  "Documented time study",
                ].map(item => (
                  <div
                    key={item}
                    className="rounded-2xl border border-dashed border-[#b8d1b9] bg-[#f7fbf5] p-5"
                  >
                    <CheckCircle2 className="h-5 w-5 text-[#5e8b62]" />
                    <p className="mt-6 text-sm font-bold text-[#274b37]">
                      {item}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-[#718178]">
                      Ready for evidence after customer approval.
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="border-y border-[#d9e6d8] bg-[#eaf3e8]">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-20 sm:px-8 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
            <div>
              <p className="text-sm font-bold text-[#356e45]">
                Before you connect
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-[-0.04em] sm:text-4xl">
                Practical answers for Oregon operators.
              </h2>
              <p className="mt-4 max-w-md text-sm leading-6 text-[#5e7363]">
                The product supports reconciliation activity, with a clear
                boundary between what the workspace automates and what facility
                teams remain responsible for verifying.
              </p>
              <Button
                onClick={openWorkspace}
                disabled={loading}
                variant="outline"
                className="mt-7 border-[#9abb99] bg-white/75 text-[#205b35] hover:bg-white"
              >
                {user ? "Open workspace" : "Start your free audit"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <Accordion
              type="single"
              collapsible
              className="rounded-[1.75rem] border border-[#d3e1d2] bg-white/85 px-5 shadow-[0_14px_32px_rgba(23,63,58,0.045)] sm:px-7"
            >
              {faqItems.map(item => (
                <AccordionItem key={item.question} value={item.question}>
                  <AccordionTrigger className="py-5 text-left text-base font-bold text-[#173f3a] hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-sm leading-6 text-[#61766a]">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section className="px-5 pb-20 sm:px-8">
          <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#173f3a] px-7 py-12 text-white shadow-[0_24px_55px_rgba(23,63,58,0.2)] sm:px-12">
            <div
              aria-hidden
              className="absolute -right-12 -top-20 h-64 w-64 rounded-full border border-[#9ed5a1]/20 shadow-[0_0_0_32px_rgba(158,213,161,0.05),0_0_0_64px_rgba(158,213,161,0.035)]"
            />
            <div className="relative max-w-3xl">
              <p className="mono-meta text-xs font-bold uppercase tracking-[0.15em] text-[#bce0bd]">
                Start with your current process
              </p>
              <h2 className="mt-4 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
                Stop reconciling by hand.
              </h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#d7e7d7]">
                Connect the facility, sync available Metrc package data, record
                physical reality, and give your team a clear place to
                investigate exceptions.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={openWorkspace}
                  disabled={loading}
                  size="lg"
                  className="h-13 rounded-2xl bg-white px-6 text-base text-[#173f3a] hover:bg-[#e8f2e6]"
                >
                  Claim Your 14-Day Free Audit
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  onClick={requestDemo}
                  variant="outline"
                  size="lg"
                  className="h-13 rounded-2xl border-[#719f7a] bg-transparent px-6 text-base text-white hover:bg-[#27524c] hover:text-white"
                >
                  Schedule a Live Demo
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-[#dce8dc] bg-[#f8fbf6]">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-8 text-sm text-[#718178] sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p>
            © {new Date().getFullYear()} MetrcMatch. Reconciliation workflow
            support for Oregon operators.
          </p>
          <button
            onClick={openWorkspace}
            className="rounded-md font-semibold text-[#356e45] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
          >
            {user ? "Open workspace" : "Sign in to workspace"}
          </button>
        </div>
      </footer>
    </div>
  );
}

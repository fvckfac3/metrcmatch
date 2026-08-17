import { useAuth } from "@/_core/hooks/useAuth";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, type ReactNode, useEffect } from "react";
import { Route, Switch, useLocation } from "wouter";
import DashboardLayout from "./components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { useBillingStatus } from "./lib/billing";

const Home = lazy(() => import("./pages/Home"));
const Landing = lazy(() => import("./pages/Landing"));
const Logs = lazy(() => import("./pages/Logs"));
const Discrepancies = lazy(() => import("./pages/Discrepancies"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Billing = lazy(() => import("./pages/Billing"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const NotFound = lazy(() => import("./pages/NotFound"));

function PageFallback() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <div className="flex items-center gap-2 rounded-xl bg-white/80 px-4 py-3 text-sm font-medium text-[#52625d] shadow-sm">
        <Loader2 className="h-4 w-4 animate-spin text-[#356e45]" />
        Loading workspace…
      </div>
    </div>
  );
}

function ProtectedPage({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();
  const { billing, isLoading, error, refresh } = useBillingStatus(
    Boolean(user)
  );
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (user && !isLoading && billing && !billing.isEntitled)
      setLocation("/pricing");
  }, [billing, isLoading, setLocation, user]);

  if (loading || (user && isLoading)) return <PageFallback />;
  if (user && error)
    return (
      <div className="ambient-grid grid min-h-screen place-items-center bg-[#f1f5ef] p-6">
        <div className="command-surface w-full max-w-md rounded-[2rem] border border-[#dce3da] bg-white p-8 text-center shadow-[0_22px_80px_rgba(18,53,47,0.12)]">
          <h1 className="text-2xl font-semibold tracking-tight text-[#173f3a]">
            We couldn’t verify facility access
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#61706b]">
            {error.message} Retry this check, or visit billing to review your
            subscription.
          </p>
          <div className="mt-7 flex justify-center gap-3">
            <button
              onClick={() => void refresh()}
              className="rounded-xl bg-[#173f3a] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0e2f2b]"
            >
              Retry
            </button>
            <button
              onClick={() => setLocation("/billing")}
              className="rounded-xl border border-[#c9d5c8] bg-white px-4 py-2.5 text-sm font-medium text-[#173f3a] transition-colors hover:bg-[#f3f7f2]"
            >
              Billing
            </button>
          </div>
        </div>
      </div>
    );
  if (user && !billing) return <PageFallback />;
  if (user && billing && !billing.isEntitled) return <PageFallback />;

  return (
    <DashboardLayout>
      <Suspense fallback={<PageFallback />}>{children}</Suspense>
    </DashboardLayout>
  );
}

function AuthenticatedPage({ children }: { children: ReactNode }) {
  return (
    <DashboardLayout>
      <Suspense fallback={<PageFallback />}>{children}</Suspense>
    </DashboardLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <Suspense fallback={<PageFallback />}>
          <Landing />
        </Suspense>
      </Route>
      <Route path="/pricing">
        <Suspense fallback={<PageFallback />}>
          <Pricing />
        </Suspense>
      </Route>
      <Route path="/billing">
        <AuthenticatedPage>
          <Billing />
        </AuthenticatedPage>
      </Route>
      <Route path="/terms">
        <Suspense fallback={<PageFallback />}>
          <Terms />
        </Suspense>
      </Route>
      <Route path="/privacy">
        <Suspense fallback={<PageFallback />}>
          <Privacy />
        </Suspense>
      </Route>
      <Route path="/workspace">
        <ProtectedPage>
          <Home />
        </ProtectedPage>
      </Route>
      <Route path="/logs">
        <ProtectedPage>
          <Logs />
        </ProtectedPage>
      </Route>
      <Route path="/discrepancies">
        <ProtectedPage>
          <Discrepancies />
        </ProtectedPage>
      </Route>
      <Route path="/reports">
        <ProtectedPage>
          <Reports />
        </ProtectedPage>
      </Route>
      <Route path="/settings">
        <ProtectedPage>
          <Settings />
        </ProtectedPage>
      </Route>
      <Route path="/404">
        <Suspense fallback={<PageFallback />}>
          <NotFound />
        </Suspense>
      </Route>
      <Route>
        <Suspense fallback={<PageFallback />}>
          <NotFound />
        </Suspense>
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

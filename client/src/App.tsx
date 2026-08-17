import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import { lazy, Suspense, type ReactNode } from "react";
import { Route, Switch } from "wouter";
import DashboardLayout from "./components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";

const Home = lazy(() => import("./pages/Home"));
const Logs = lazy(() => import("./pages/Logs"));
const Discrepancies = lazy(() => import("./pages/Discrepancies"));
const Reports = lazy(() => import("./pages/Reports"));
const Settings = lazy(() => import("./pages/Settings"));
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

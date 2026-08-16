import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import DashboardLayout from "./components/DashboardLayout";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Discrepancies from "./pages/Discrepancies";
import Home from "./pages/Home";
import Logs from "./pages/Logs";
import NotFound from "./pages/NotFound";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function ProtectedPage({ children }: { children: React.ReactNode }) { return <DashboardLayout>{children}</DashboardLayout>; }

function Router() {
  return <Switch>
    <Route path="/"><ProtectedPage><Home /></ProtectedPage></Route>
    <Route path="/logs"><ProtectedPage><Logs /></ProtectedPage></Route>
    <Route path="/discrepancies"><ProtectedPage><Discrepancies /></ProtectedPage></Route>
    <Route path="/reports"><ProtectedPage><Reports /></ProtectedPage></Route>
    <Route path="/settings"><ProtectedPage><Settings /></ProtectedPage></Route>
    <Route path="/404" component={NotFound} />
    <Route component={NotFound} />
  </Switch>;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}

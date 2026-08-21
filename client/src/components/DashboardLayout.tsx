import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { startLogin } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import { trpc } from "@/lib/trpc";
import {
  AlertTriangle,
  BellRing,
  ClipboardCheck,
  CreditCard,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const allMenuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/workspace" },
  { icon: ClipboardCheck, label: "Physical logs", path: "/logs" },
  { icon: AlertTriangle, label: "Discrepancies", path: "/discrepancies" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Facility & Metrc", path: "/settings" },
  { icon: CreditCard, label: "Billing", path: "/billing" },
];

const ownerMenuItems = [
  { icon: Inbox, label: "Contact requests", path: "/admin/contact-requests" },
  { icon: BellRing, label: "Custom notices", path: "/admin/notifications" },
];

const notificationStyles = {
  info: {
    panel: "border-[#a9cfe6] bg-[#edf7fc] text-[#245a80]",
    icon: "bg-[#cfe9f7] text-[#1d5576]",
  },
  success: {
    panel: "border-[#b9d8bd] bg-[#f2faef] text-[#285a33]",
    icon: "bg-[#d9efda] text-[#285a33]",
  },
  warning: {
    panel: "border-[#efd59a] bg-[#fff8e8] text-[#7a5a14]",
    icon: "bg-[#f9e8bd] text-[#785812]",
  },
  critical: {
    panel: "border-[#e8b7ae] bg-[#fff6f4] text-[#993c30]",
    icon: "bg-[#f8d9d3] text-[#8e342a]",
  },
};

const SIDEBAR_WIDTH_KEY = "metrcmatch-sidebar-width";
const DEFAULT_WIDTH = 276;
const MIN_WIDTH = 216;
const MAX_WIDTH = 340;

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarWidth, setSidebarWidth] = useState(
    () => Number(localStorage.getItem(SIDEBAR_WIDTH_KEY)) || DEFAULT_WIDTH
  );
  const { loading, user } = useAuth();
  const facilityQuery = trpc.facility.current.useQuery(undefined, {
    enabled: Boolean(user),
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
  }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) {
    return (
      <div className="ambient-grid grid min-h-screen place-items-center bg-[#f1f5ef] p-6">
        <div className="command-surface motion-rise w-full max-w-md rounded-[2rem] border border-[#dce3da] bg-white p-8 shadow-[0_22px_80px_rgba(18,53,47,0.12)]">
          <div className="mb-6 flex h-12 w-12 rotate-[-4deg] items-center justify-center rounded-2xl bg-[#173f3a] text-white shadow-[0_10px_22px_rgba(23,63,58,0.24)]">
            <ShieldCheck className="h-6 w-6 rotate-[4deg]" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#173f3a]">
            Secure reconciliation workspace
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#61706b]">
            Sign in to manage facility inventory records, physical counts, and
            reconciliation reports.
          </p>
          <Button
            onClick={() => startLogin()}
            size="lg"
            className="mt-7 w-full bg-[#173f3a] hover:bg-[#0e2f2b]"
          >
            Sign in to MetrcMatch
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider
      style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}
    >
      <DashboardLayoutContent
        setSidebarWidth={setSidebarWidth}
        memberRole={facilityQuery.data?.memberRole}
        subscriptionPlan={facilityQuery.data?.subscriptionPlan}
        subscriptionStatus={facilityQuery.data?.subscriptionStatus}
        trialEndsAt={facilityQuery.data?.trialEndsAt}
      >
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({
  children,
  setSidebarWidth,
  memberRole,
  subscriptionPlan,
  subscriptionStatus,
  trialEndsAt,
}: {
  children: React.ReactNode;
  setSidebarWidth: (width: number) => void;
  memberRole?: "manager" | "staff";
  subscriptionPlan?: "starter" | "growth" | "enterprise" | null;
  subscriptionStatus?: string;
  trialEndsAt?: Date | null;
}) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const menuItems =
    memberRole === "staff"
      ? allMenuItems.filter(item => item.path === "/logs")
      : user?.isOwner
        ? [...allMenuItems, ...ownerMenuItems]
        : allMenuItems;
  const activeMenuItem = menuItems.find(item => item.path === location);

  useEffect(() => {
    const move = (event: MouseEvent) => {
      if (!isResizing) return;
      const left = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const next = event.clientX - left;
      if (next >= MIN_WIDTH && next <= MAX_WIDTH) setSidebarWidth(next);
    };
    const up = () => setIsResizing(false);
    if (isResizing) {
      document.addEventListener("mousemove", move);
      document.addEventListener("mouseup", up);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", move);
      document.removeEventListener("mouseup", up);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar
          collapsible="icon"
          className="border-r border-[#dce3da] bg-[#fbfcfa]/95 backdrop-blur-xl"
          disableTransition={isResizing}
        >
          <SidebarHeader className="h-[76px] justify-center px-3">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSidebar}
                aria-label="Toggle navigation"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#61706b] transition-colors hover:bg-[#eaf0e9] hover:text-[#173f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              {!isCollapsed && (
                <div className="flex min-w-0 items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-xl bg-[#173f3a] text-white">
                    <ShieldCheck className="h-4 w-4" />
                  </span>
                  <span className="truncate text-base font-semibold tracking-tight text-[#173f3a]">
                    MetrcMatch
                  </span>
                </div>
              )}
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2 pt-3">
            {!isCollapsed && (
              <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#91a09a]">
                Compliance workspace
              </p>
            )}
            <SidebarMenu className="gap-1.5">
              {menuItems.map(item => {
                const active = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={active}
                      onClick={() => setLocation(item.path)}
                      tooltip={item.label}
                      className="surface-lift h-11 rounded-xl px-3 text-[#52625d] data-[active=true]:bg-[#dfeee0] data-[active=true]:text-[#173f3a] data-[active=true]:shadow-[inset_3px_0_0_#356e45,0_6px_16px_rgba(18,53,47,0.05)]"
                    >
                      <item.icon className="h-[18px] w-[18px]" />
                      <span className="font-medium">{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-3">
            {!isCollapsed && user?.isOwner && (
              <button
                onClick={() => setLocation("/workspace")}
                className="mb-3 w-full rounded-xl border border-[#9fc4a4] bg-[#e9f5ea] p-3 text-left transition-colors hover:bg-[#dcefdc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#356e45]">
                  Owner demo access
                </p>
                <p className="mt-1 text-xs font-semibold text-[#173f3a]">
                  Open full workspace
                </p>
              </button>
            )}
            {!isCollapsed && memberRole !== "staff" && !user?.isOwner && (
              <button
                onClick={() => setLocation("/billing")}
                className="mb-3 w-full rounded-xl border border-[#d6e3d5] bg-[#f6faf5] p-3 text-left transition-colors hover:bg-[#eef5ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#5e8b62]">
                  {subscriptionStatus === "trialing"
                    ? "Audit trial"
                    : "Facility plan"}
                </p>
                <p className="mt-1 text-xs font-semibold text-[#173f3a]">
                  {subscriptionPlan
                    ? `${subscriptionPlan.charAt(0).toUpperCase()}${subscriptionPlan.slice(1)}`
                    : "Choose a plan"}
                  {subscriptionStatus === "trialing" && trialEndsAt
                    ? ` · ${Math.max(0, Math.ceil((trialEndsAt.getTime() - Date.now()) / 86_400_000))} days`
                    : ""}
                </p>
              </button>
            )}
            {!isCollapsed && (
              <div className="mb-3 rounded-xl bg-[#f0f5ef] p-3 text-xs leading-5 text-[#61706b]">
                <span className="font-semibold text-[#173f3a]">
                  Advisory support.
                </span>{" "}
                Verify records and complete required Metrc reporting.
              </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-xl px-1.5 py-1.5 text-left transition-colors hover:bg-[#eef3ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]">
                  <Avatar className="h-8 w-8 border border-[#c9d5c8]">
                    <AvatarFallback className="bg-[#dfeee0] text-xs font-bold text-[#173f3a]">
                      {user?.name?.charAt(0).toUpperCase() || "M"}
                    </AvatarFallback>
                  </Avatar>
                  {!isCollapsed && (
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-[#173f3a]">
                        {user?.name || "Facility user"}
                      </p>
                      <p className="truncate text-xs text-[#7d8a84]">
                        {memberRole === "staff" ? "Staff" : "Manager"}
                      </p>
                    </div>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={logout}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        {!isCollapsed && (
          <div
            className="absolute right-0 top-0 z-50 h-full w-1 cursor-col-resize hover:bg-[#5e8b62]/25"
            onMouseDown={() => setIsResizing(true)}
          />
        )}
      </div>
      <SidebarInset className="relative overflow-hidden bg-[#f1f5ef]">
        <div aria-hidden className="ambient-orbit ambient-orbit-one" />
        <div aria-hidden className="ambient-orbit ambient-orbit-two" />
        <div
          aria-hidden
          className="ambient-grid pointer-events-none absolute inset-0 opacity-50"
        />
        {isMobile && (
          <div className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-[#dce3da] bg-[#fbfcfa]/90 px-3 backdrop-blur-xl">
            <SidebarTrigger className="h-9 w-9 rounded-xl" />
            <div>
              <p className="text-sm font-semibold text-[#173f3a]">MetrcMatch</p>
              <p className="text-xs text-[#7d8a84]">
                {activeMenuItem?.label ?? "Workspace"}
              </p>
            </div>
          </div>
        )}
        <main className="relative z-10 min-h-screen flex-1 p-4 sm:p-6 lg:p-8">
          <WorkspaceNotifications />
          {children}
        </main>
      </SidebarInset>
    </>
  );
}

function WorkspaceNotifications() {
  const utils = trpc.useUtils();
  const notificationsQuery = trpc.customNotifications.listActive.useQuery();
  const dismiss = trpc.customNotifications.dismiss.useMutation({
    onSuccess: () => void utils.customNotifications.listActive.invalidate(),
  });
  const notifications = notificationsQuery.data ?? [];

  if (!notifications.length) return null;

  return (
    <section
      aria-label="Workspace notifications"
      className="mx-auto mb-5 max-w-7xl space-y-3"
    >
      {notifications.map(notification => {
        const style = notificationStyles[notification.severity];
        return (
          <div
            key={notification.id}
            role={notification.severity === "critical" ? "alert" : "status"}
            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-[0_10px_22px_rgba(18,53,47,0.04)] ${style.panel}`}
          >
            <span
              className={`grid h-8 w-8 shrink-0 place-items-center rounded-xl ${style.icon}`}
            >
              <BellRing className="h-4 w-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold">{notification.title}</p>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 opacity-90">
                {notification.message}
              </p>
            </div>
            <button
              type="button"
              aria-label={`Dismiss ${notification.title}`}
              disabled={dismiss.isPending}
              onClick={() => dismiss.mutate({ id: notification.id })}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-xl transition-colors hover:bg-white/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current disabled:cursor-not-allowed disabled:opacity-60"
            >
              <X className="h-4 w-4" aria-hidden />
            </button>
          </div>
        );
      })}
    </section>
  );
}

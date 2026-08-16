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
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  PanelLeft,
  Settings,
  ShieldCheck,
} from "lucide-react";
import { CSSProperties, useEffect, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

const allMenuItems = [
  { icon: LayoutDashboard, label: "Overview", path: "/" },
  { icon: ClipboardCheck, label: "Physical logs", path: "/logs" },
  { icon: AlertTriangle, label: "Discrepancies", path: "/discrepancies" },
  { icon: FileText, label: "Reports", path: "/reports" },
  { icon: Settings, label: "Facility & Metrc", path: "/settings" },
];

const SIDEBAR_WIDTH_KEY = "metrcmatch-sidebar-width";
const DEFAULT_WIDTH = 276;
const MIN_WIDTH = 216;
const MAX_WIDTH = 340;

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => Number(localStorage.getItem(SIDEBAR_WIDTH_KEY)) || DEFAULT_WIDTH);
  const { loading, user } = useAuth();
  const facilityQuery = trpc.facility.current.useQuery(undefined, { enabled: Boolean(user) });

  useEffect(() => { localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth)); }, [sidebarWidth]);

  if (loading) return <DashboardLayoutSkeleton />;
  if (!user) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#f5f7f3] p-6">
        <div className="w-full max-w-md rounded-3xl border border-[#dce3da] bg-white p-8 shadow-[0_18px_70px_rgba(18,53,47,0.10)]">
          <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#173f3a] text-white"><ShieldCheck className="h-6 w-6" /></div>
          <h1 className="text-2xl font-semibold tracking-tight text-[#173f3a]">Secure reconciliation workspace</h1>
          <p className="mt-3 text-sm leading-6 text-[#61706b]">Sign in to manage facility inventory records, physical counts, and reconciliation reports.</p>
          <Button onClick={() => startLogin()} size="lg" className="mt-7 w-full bg-[#173f3a] hover:bg-[#0e2f2b]">Sign in to MetrcMatch</Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent setSidebarWidth={setSidebarWidth} memberRole={facilityQuery.data?.memberRole}>
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

function DashboardLayoutContent({ children, setSidebarWidth, memberRole }: { children: React.ReactNode; setSidebarWidth: (width: number) => void; memberRole?: "manager" | "staff" }) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const menuItems = memberRole === "staff" ? allMenuItems.filter(item => item.path === "/logs") : allMenuItems;
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
        <Sidebar collapsible="icon" className="border-r border-[#dce3da] bg-[#fbfcfa]" disableTransition={isResizing}>
          <SidebarHeader className="h-[76px] justify-center px-3">
            <div className="flex items-center gap-3">
              <button onClick={toggleSidebar} aria-label="Toggle navigation" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-[#61706b] transition-colors hover:bg-[#eaf0e9] hover:text-[#173f3a] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]">
                <PanelLeft className="h-4 w-4" />
              </button>
              {!isCollapsed && <div className="flex min-w-0 items-center gap-2.5"><span className="grid h-8 w-8 place-items-center rounded-xl bg-[#173f3a] text-white"><ShieldCheck className="h-4 w-4" /></span><span className="truncate text-base font-semibold tracking-tight text-[#173f3a]">MetrcMatch</span></div>}
            </div>
          </SidebarHeader>
          <SidebarContent className="px-2 pt-3">
            {!isCollapsed && <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-[0.16em] text-[#91a09a]">Compliance workspace</p>}
            <SidebarMenu className="gap-1">
              {menuItems.map(item => {
                const active = location === item.path;
                return <SidebarMenuItem key={item.path}><SidebarMenuButton isActive={active} onClick={() => setLocation(item.path)} tooltip={item.label} className="h-11 rounded-xl px-3 text-[#52625d] data-[active=true]:bg-[#dfeee0] data-[active=true]:text-[#173f3a] data-[active=true]:shadow-none"><item.icon className="h-[18px] w-[18px]" /><span className="font-medium">{item.label}</span></SidebarMenuButton></SidebarMenuItem>;
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-3">
            {!isCollapsed && <div className="mb-3 rounded-xl bg-[#f0f5ef] p-3 text-xs leading-5 text-[#61706b]"><span className="font-semibold text-[#173f3a]">Advisory support.</span> Verify records and complete required Metrc reporting.</div>}
            <DropdownMenu>
              <DropdownMenuTrigger asChild><button className="flex w-full items-center gap-3 rounded-xl px-1.5 py-1.5 text-left transition-colors hover:bg-[#eef3ed] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"><Avatar className="h-8 w-8 border border-[#c9d5c8]"><AvatarFallback className="bg-[#dfeee0] text-xs font-bold text-[#173f3a]">{user?.name?.charAt(0).toUpperCase() || "M"}</AvatarFallback></Avatar>{!isCollapsed && <div className="min-w-0"><p className="truncate text-sm font-medium text-[#173f3a]">{user?.name || "Facility user"}</p><p className="truncate text-xs text-[#7d8a84]">{memberRole === "staff" ? "Staff" : "Manager"}</p></div>}</button></DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48"><DropdownMenuItem onClick={logout} className="cursor-pointer text-destructive focus:text-destructive"><LogOut className="mr-2 h-4 w-4" />Sign out</DropdownMenuItem></DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        {!isCollapsed && <div className="absolute right-0 top-0 z-50 h-full w-1 cursor-col-resize hover:bg-[#5e8b62]/25" onMouseDown={() => setIsResizing(true)} />}
      </div>
      <SidebarInset className="bg-[#f5f7f3]">
        {isMobile && <div className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b border-[#dce3da] bg-[#fbfcfa]/95 px-3 backdrop-blur"><SidebarTrigger className="h-9 w-9 rounded-xl" /><div><p className="text-sm font-semibold text-[#173f3a]">MetrcMatch</p><p className="text-xs text-[#7d8a84]">{activeMenuItem?.label ?? "Workspace"}</p></div></div>}
        <main className="min-h-screen flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </SidebarInset>
    </>
  );
}

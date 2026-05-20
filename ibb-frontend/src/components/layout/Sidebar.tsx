import { NavLink } from "react-router-dom";
import {
  Home, Upload, BarChart3, MessageSquare, Search, FileText, Bell,
  Sparkles, Brain, Bookmark, ShieldCheck, Quote, Network, Gauge,
  Activity, History, User, Settings, TrendingUp, AlertTriangle, Library,
  ChevronLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui";
import { Logo } from "./Logo";

const groups = [
  { label: "Workspace", items: [
    { to: "/app/dashboard", label: "Dashboard", icon: Home },
    { to: "/app/upload", label: "Upload Center", icon: Upload },
    { to: "/app/analysis", label: "Content Analysis", icon: BarChart3 },
    { to: "/app/search", label: "Search", icon: Search },
  ]},
  { label: "Intelligence", items: [
    { to: "/app/sentiment", label: "Sentiment", icon: Activity },
    { to: "/app/trends", label: "Viral Trends", icon: TrendingUp },
    { to: "/app/misinformation", label: "Misinformation", icon: AlertTriangle },
    { to: "/app/research", label: "Research Explorer", icon: Library },
    { to: "/app/sources", label: "Sources", icon: Bookmark },
    { to: "/app/credibility", label: "Credibility", icon: Gauge },
    { to: "/app/fact-check", label: "Fact Check", icon: ShieldCheck },
    { to: "/app/citations", label: "Citations", icon: Quote },
    { to: "/app/semantic", label: "Semantic Match", icon: Network },
  ]},
  { label: "AI", items: [
    { to: "/app/ai/assistant", label: "Assistant", icon: MessageSquare },
    { to: "/app/ai/insights", label: "Insights", icon: Sparkles },
    { to: "/app/ai/recommendations", label: "Recommendations", icon: Brain },
    { to: "/app/ai/history", label: "Chat History", icon: History },
  ]},
  { label: "Account", items: [
    { to: "/app/reports", label: "Reports", icon: FileText },
    { to: "/app/notifications", label: "Notifications", icon: Bell },
    { to: "/app/activity", label: "Activity", icon: History },
    { to: "/app/profile", label: "Profile", icon: User },
    { to: "/app/settings", label: "Settings", icon: Settings },
  ]},
];

export function Sidebar() {
  const open = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);

  return (
    <aside className={cn(
      "hidden lg:flex flex-col border-r border-border bg-surface transition-all duration-300 ease-spring shrink-0",
      open ? "w-60" : "w-[60px]"
    )}>
      {/* Logo */}
      <div className={cn(
        "h-14 flex items-center border-b border-border shrink-0",
        open ? "px-4 gap-3 justify-between" : "px-3.5 justify-center"
      )}>
        {open ? (
          <>
            <Logo />
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-md text-muted hover:text-text hover:bg-elevated transition-colors"
              aria-label="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          </>
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md text-muted hover:text-text hover:bg-elevated transition-colors"
            aria-label="Expand sidebar"
          >
            <div className="h-5 w-5 rounded bg-brand flex items-center justify-center">
              <span className="text-[10px] font-bold text-brand-fg">I</span>
            </div>
          </button>
        )}
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto scrollbar-thin py-3">
        {groups.map((g, gi) => (
          <div key={g.label} className={cn("mb-2", open ? "px-3" : "px-2")}>
            {open && (
              <p className="px-2 text-[10px] uppercase tracking-widest text-muted mb-1.5 font-medium">
                {g.label}
              </p>
            )}
            {!open && gi > 0 && <div className="h-px bg-border mb-2 mx-1" />}
            <nav className="flex flex-col gap-0.5">
              {g.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  title={!open ? it.label : undefined}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 rounded-lg text-sm transition-all duration-150 group relative",
                    open ? "px-2.5 py-2" : "px-2 py-2 justify-center",
                    isActive
                      ? "bg-brand/10 text-brand font-medium nav-active-bar"
                      : "text-muted hover:bg-elevated hover:text-text"
                  )}
                >
                  <it.icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                  {open && <span className="truncate">{it.label}</span>}
                </NavLink>
              ))}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  );
}

import { NavLink } from "react-router-dom";
import { LayoutDashboard, Users, Mail, Activity, AlertTriangle, FileText, BarChart3, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "./Logo";

const items = [
  { to: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/invites", label: "Invites", icon: Mail },
  { to: "/admin/api-monitor", label: "API Monitor", icon: Activity },
  { to: "/admin/errors", label: "Errors", icon: AlertTriangle },
  { to: "/admin/logs", label: "Logs", icon: FileText },
  { to: "/admin/moderation", label: "Moderation", icon: ShieldCheck },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
];

export function AdminSidebar() {
  return (
    <aside className="hidden lg:flex flex-col w-60 border-r border-border bg-surface shrink-0">
      <div className="h-14 flex items-center px-5 border-b border-border">
        <Logo />
        <span className="ml-2 text-xs bg-danger/15 text-danger rounded px-1.5 py-0.5 font-medium">Admin</span>
      </div>
      <nav className="flex-1 overflow-y-auto scrollbar-thin py-3 px-3 space-y-0.5">
        {items.map(it => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
              isActive ? "bg-brand/10 text-brand font-medium" : "text-muted hover:bg-elevated hover:text-text"
            )}
          >
            <it.icon className="h-4 w-4 shrink-0" />
            {it.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

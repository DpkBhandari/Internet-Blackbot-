import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, Moon, Search, Sun, Command, User, LogOut, Settings, ChevronDown } from "lucide-react";
import { useUIStore } from "@/stores/ui";
import { useAuthStore } from "@/stores/auth";
import { useNotificationsStore } from "@/stores/notifications";
import { cn } from "@/lib/utils";

export function Topbar() {
  const nav = useNavigate();
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const setCommand = useUIStore((s) => s.setCommand);
  const theme = useUIStore((s) => s.theme);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const unread = useNotificationsStore((s) => s.unread);
  const [userMenu, setUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setUserMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Global keyboard shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") { e.preventDefault(); setCommand(true); }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [setCommand]);

  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() ?? "U";

  return (
    <header className="h-14 border-b border-border bg-surface/90 backdrop-blur-sm flex items-center px-4 gap-3 sticky top-0 z-30">
      {/* Search trigger */}
      <button
        onClick={() => setCommand(true)}
        className="flex items-center gap-2 px-3 h-9 rounded-lg border border-border bg-elevated text-sm text-muted w-72 hover:border-brand/50 hover:bg-elevated transition-all duration-150 group"
      >
        <Search className="h-3.5 w-3.5 group-hover:text-brand transition-colors" />
        <span className="flex-1 text-left">Search anything…</span>
        <span className="hidden md:inline-flex items-center gap-0.5 text-[11px] text-muted border border-border rounded px-1 py-0.5 font-mono">
          <Command className="h-2.5 w-2.5" />K
        </span>
      </button>

      <div className="ml-auto flex items-center gap-1">
        {/* Notifications */}
        <button
          className="relative p-2 rounded-lg hover:bg-elevated transition-colors group"
          onClick={() => nav("/app/notifications")}
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4 text-muted group-hover:text-text transition-colors" />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-danger badge-bounce" />
          )}
        </button>

        {/* Theme */}
        <button
          className="p-2 rounded-lg hover:bg-elevated transition-colors group"
          onClick={toggleTheme}
          aria-label="Toggle theme"
        >
          {theme === "dark"
            ? <Sun className="h-4 w-4 text-muted group-hover:text-warning transition-colors" />
            : <Moon className="h-4 w-4 text-muted group-hover:text-brand transition-colors" />
          }
        </button>

        {/* User menu */}
        <div className="relative ml-1" ref={menuRef}>
          <button
            onClick={() => setUserMenu(!userMenu)}
            className="flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-lg hover:bg-elevated transition-colors group"
            aria-label="User menu"
          >
            <div className="h-7 w-7 rounded-lg bg-brand/15 text-brand flex items-center justify-center text-xs font-bold border border-brand/20">
              {initials}
            </div>
            <span className="hidden md:block text-sm font-medium truncate max-w-[100px]">{user?.name ?? "User"}</span>
            <ChevronDown className={cn(
              "h-3.5 w-3.5 text-muted transition-transform duration-200",
              userMenu && "rotate-180"
            )} />
          </button>

          {userMenu && (
            <div className="absolute right-0 top-full mt-1.5 w-52 glass-heavy rounded-xl shadow-float border border-border overflow-hidden animate-slide-up z-50">
              <div className="p-3 border-b border-border">
                <p className="text-sm font-semibold truncate">{user?.name}</p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={() => { nav("/app/profile"); setUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-elevated transition-colors text-left"
                >
                  <User className="h-4 w-4 text-muted" /> Profile
                </button>
                <button
                  onClick={() => { nav("/app/settings"); setUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-elevated transition-colors text-left"
                >
                  <Settings className="h-4 w-4 text-muted" /> Settings
                </button>
                <div className="h-px bg-border my-1" />
                <button
                  onClick={() => { logout(); setUserMenu(false); }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg hover:bg-danger/10 hover:text-danger transition-colors text-left text-danger"
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

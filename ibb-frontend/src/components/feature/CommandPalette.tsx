import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, X, ArrowRight, LayoutDashboard, Upload, BarChart3, MessageSquare, FileText, Settings, ShieldCheck, TrendingUp, Brain } from "lucide-react";
import { createPortal } from "react-dom";
import { useUIStore } from "@/stores/ui";
import { cn } from "@/lib/utils";

const commands = [
  { label: "Dashboard", to: "/app/dashboard", icon: LayoutDashboard, group: "Navigate" },
  { label: "Upload Center", to: "/app/upload", icon: Upload, group: "Navigate" },
  { label: "Content Analysis", to: "/app/analysis", icon: BarChart3, group: "Navigate" },
  { label: "AI Assistant", to: "/app/ai/assistant", icon: MessageSquare, group: "AI" },
  { label: "AI Insights", to: "/app/ai/insights", icon: Brain, group: "AI" },
  { label: "Viral Trends", to: "/app/trends", icon: TrendingUp, group: "Intelligence" },
  { label: "Misinformation Tracker", to: "/app/misinformation", icon: ShieldCheck, group: "Intelligence" },
  { label: "Reports", to: "/app/reports", icon: FileText, group: "Account" },
  { label: "Settings", to: "/app/settings", icon: Settings, group: "Account" },
];

export default function CommandPalette() {
  const open = useUIStore((s) => s.commandOpen);
  const setCommand = useUIStore((s) => s.setCommand);
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = commands.filter(c =>
    !q || c.label.toLowerCase().includes(q.toLowerCase()) || c.group.toLowerCase().includes(q.toLowerCase())
  );

  useEffect(() => {
    if (open) { setTimeout(() => inputRef.current?.focus(), 50); setQ(""); setActiveIdx(0); }
  }, [open]);

  useEffect(() => { setActiveIdx(0); }, [q]);

  const select = (to: string) => { nav(to); setCommand(false); };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)); }
    if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    if (e.key === "Enter" && filtered[activeIdx]) select(filtered[activeIdx].to);
    if (e.key === "Escape") setCommand(false);
  };

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setCommand(false)} />
      <div className="relative w-full max-w-lg glass-heavy rounded-2xl shadow-float overflow-hidden animate-slide-up">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
          <Search className="h-4 w-4 text-muted shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search commands and pages…"
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted"
          />
          {q && (
            <button onClick={() => setQ("")} className="p-0.5 rounded text-muted hover:text-text">
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center text-[10px] font-mono text-muted border border-border rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto scrollbar-thin py-2">
          {filtered.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted">No results for "{q}"</div>
          ) : (
            (() => {
              const groups = [...new Set(filtered.map(c => c.group))];
              return groups.map(group => (
                <div key={group}>
                  <div className="px-4 py-1.5 text-[10px] font-medium uppercase tracking-wider text-muted">{group}</div>
                  {filtered.filter(c => c.group === group).map((cmd, i) => {
                    const globalIdx = filtered.indexOf(cmd);
                    return (
                      <button
                        key={cmd.to}
                        onClick={() => select(cmd.to)}
                        onMouseEnter={() => setActiveIdx(globalIdx)}
                        className={cn(
                          "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors",
                          globalIdx === activeIdx ? "bg-brand/10 text-brand" : "hover:bg-elevated"
                        )}
                      >
                        <cmd.icon className="h-4 w-4 shrink-0" />
                        <span className="flex-1 text-left">{cmd.label}</span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted opacity-0 group-hover:opacity-100" />
                      </button>
                    );
                  })}
                </div>
              ));
            })()
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

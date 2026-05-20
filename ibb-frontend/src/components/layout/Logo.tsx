import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("flex items-center gap-2.5 group", className)}>
      <div className="h-7 w-7 rounded-lg bg-brand flex items-center justify-center shadow-glow-sm group-hover:shadow-glow-md transition-shadow duration-300 relative">
        <span className="text-[11px] font-bold text-brand-fg font-mono">IBB</span>
        <div className="absolute inset-0 rounded-lg bg-brand/20 group-hover:scale-110 transition-transform" />
      </div>
      <span className="font-display font-semibold text-sm tracking-tight leading-none">
        Internet<br />
        <span className="text-brand">Black Box</span>
      </span>
    </Link>
  );
}

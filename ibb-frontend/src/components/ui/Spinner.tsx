import { cn } from "@/lib/utils";

export function Spinner({ className, size = "md" }: { className?: string; size?: "sm" | "md" | "lg" | "xl" }) {
  const sizes = { sm: "h-4 w-4 border-[2px]", md: "h-6 w-6 border-[2px]", lg: "h-10 w-10 border-[3px]", xl: "h-16 w-16 border-4" };
  return (
    <div className={cn(
      "rounded-full border-brand/20 border-t-brand animate-spin",
      sizes[size], className
    )} />
  );
}

export function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg">
      <div className="flex flex-col items-center gap-4 animate-fade-up">
        <div className="relative">
          <Spinner size="xl" />
          <div className="absolute inset-0 rounded-full animate-ping bg-brand/10" />
        </div>
        <p className="text-sm text-muted font-medium tracking-wide">Loading workspace…</p>
      </div>
    </div>
  );
}

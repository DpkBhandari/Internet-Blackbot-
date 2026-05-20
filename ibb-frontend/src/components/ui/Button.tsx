import { forwardRef, type ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

type Variant = "primary" | "secondary" | "ghost" | "outline" | "danger" | "success" | "accent";
type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
} 

const variants: Record<Variant, string> = {
  primary: "bg-brand text-brand-fg hover:opacity-90 shadow-glow-sm hover:shadow-glow-md active:scale-[0.98]",
  secondary: "bg-elevated text-text hover:bg-elevated/70 border border-border active:scale-[0.98]",
  ghost: "text-text hover:bg-elevated active:scale-[0.98]",
  outline: "border border-border text-text hover:bg-elevated hover:border-brand active:scale-[0.98]",
  danger: "bg-danger text-white hover:opacity-90 active:scale-[0.98]",
  success: "bg-success text-white hover:opacity-90 active:scale-[0.98]",
  accent: "bg-accent text-white hover:opacity-90 active:scale-[0.98]",
};
const sizes: Record<Size, string> = {
  xs: "h-7 px-2.5 text-xs gap-1.5",
  sm: "h-8 px-3 text-sm gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-11 px-5 text-base gap-2",
  xl: "h-13 px-7 text-base gap-2.5",
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { className, variant = "primary", size = "md", loading, disabled, children, icon, ...rest }, ref
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-150",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100",
        "focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
        variants[variant], sizes[size], className
      )}
      {...rest}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin shrink-0" /> : icon}
      {children}
    </button>
  );
});

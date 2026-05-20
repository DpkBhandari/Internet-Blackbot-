import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type Variant = "default" | "brand" | "success" | "warning" | "danger" | "accent" | "outline";

interface Props extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  dot?: boolean;
  pulse?: boolean;
}

const variants: Record<Variant, string> = {
  default: "bg-elevated text-muted border border-border",
  brand: "bg-brand/15 text-brand border border-brand/20",
  success: "bg-success/15 text-success border border-success/20",
  warning: "bg-warning/15 text-warning border border-warning/20",
  danger: "bg-danger/15 text-danger border border-danger/20",
  accent: "bg-accent/15 text-accent border border-accent/20",
  outline: "border border-border text-muted",
};

export function Badge({ className, variant = "default", dot, pulse, children, ...rest }: Props) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant], className
      )}
      {...rest}
    >
      {dot && (
        <span className={cn(
          "h-1.5 w-1.5 rounded-full",
          variant === "success" && "bg-success",
          variant === "warning" && "bg-warning",
          variant === "danger" && "bg-danger",
          variant === "brand" && "bg-brand",
          variant === "accent" && "bg-accent",
          (variant === "default" || variant === "outline") && "bg-muted",
          pulse && "dot-blink",
        )} />
      )}
      {children}
    </span>
  );
}

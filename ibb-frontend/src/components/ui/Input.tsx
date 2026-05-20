import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, Props>(function Input(
  { className, error, icon, suffix, ...rest }, ref
) {
  if (icon || suffix) {
    return (
      <div className="relative flex items-center">
        {icon && <span className="absolute left-3 text-muted pointer-events-none">{icon}</span>}
        <input
          ref={ref}
          className={cn(
            "w-full h-10 rounded-lg border bg-elevated text-sm placeholder:text-muted",
            "transition-all duration-150",
            "focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand",
            error ? "border-danger focus:ring-danger/40" : "border-border",
            icon ? "pl-9" : "pl-3",
            suffix ? "pr-9" : "pr-3",
            className
          )}
          {...rest}
        />
        {suffix && <span className="absolute right-3 text-muted pointer-events-none">{suffix}</span>}
      </div>
    );
  }
  return (
    <input
      ref={ref}
      className={cn(
        "w-full h-10 rounded-lg border bg-elevated px-3 text-sm placeholder:text-muted",
        "transition-all duration-150",
        "focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand",
        error ? "border-danger focus:ring-danger/40" : "border-border",
        className
      )}
      {...rest}
    />
  );
});

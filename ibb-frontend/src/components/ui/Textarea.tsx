import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }>(
  function Textarea({ className, error, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full rounded-lg border bg-elevated px-3 py-2.5 text-sm placeholder:text-muted resize-none",
          "transition-all duration-150",
          "focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand",
          error ? "border-danger focus:ring-danger/40" : "border-border",
          className
        )}
        {...rest}
      />
    );
  }
);

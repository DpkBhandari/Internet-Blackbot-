import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glow?: boolean;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { className, hover, glow, ...rest }, ref
) {
  return (
    <div
      ref={ref}
      className={cn(
        "rounded-xl border border-border bg-surface shadow-card transition-all duration-200",
        hover && "hover:shadow-card-hover hover:-translate-y-0.5 cursor-pointer",
        glow && "hover:shadow-glow-sm hover:border-brand/30",
        className
      )}
      {...rest}
    />
  );
});

export function CardHeader({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4 border-b border-border flex items-center justify-between", className)} {...rest} />;
}
export function CardBody({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5", className)} {...rest} />;
}
export function CardFooter({ className, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-5 py-4 border-t border-border bg-elevated/50 rounded-b-xl", className)} {...rest} />;
}
export function CardTitle({ className, ...rest }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-display font-semibold text-base", className)} {...rest} />;
}

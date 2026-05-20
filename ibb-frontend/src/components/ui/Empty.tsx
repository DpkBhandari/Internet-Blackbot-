import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

interface Props {
  title?: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function Empty({
  title = "Nothing here yet",
  description = "Data will appear here once available.",
  icon,
  action,
  className,
}: Props) {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-6 text-center animate-fade-up",
      className
    )}>
      <div className="h-16 w-16 rounded-2xl bg-elevated flex items-center justify-center mb-4 float">
        {icon || <Inbox className="h-7 w-7 text-muted" />}
      </div>
      <h3 className="font-display font-semibold text-base mb-2">{title}</h3>
      <p className="text-sm text-muted max-w-xs">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

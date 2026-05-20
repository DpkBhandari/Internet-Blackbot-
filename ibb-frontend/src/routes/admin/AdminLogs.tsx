import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { formatDateFull } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function AdminLogs() {
  const [level, setLevel] = useState("");
  const { data, isLoading } = useQuery({
    queryKey: ["admin-logs", level],
    queryFn: async () => (await api.get(`/admin/logs${level ? `?level=${level}` : ""}`)).data,
    refetchInterval: 15000,
  });

  const levelVariant: Record<string, any> = { error: "danger", warn: "warning", info: "brand", debug: "default" };

  return (
    <div>
      <PageHeader title="System Logs" description="Real-time application logs." />
      <div className="flex gap-2 mb-4">
        {["", "error", "warn", "info", "debug"].map(l => (
          <button key={l} onClick={() => setLevel(l)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", level === l ? "border-brand bg-brand/10 text-brand" : "border-border text-muted hover:border-brand/40")}>
            {l || "All"}
          </button>
        ))}
      </div>
      {isLoading ? <SkeletonTable /> : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead><tr className="text-left text-muted border-b border-border">
                <th className="px-4 py-2.5 font-medium">Time</th>
                <th className="px-4 py-2.5 font-medium">Level</th>
                <th className="px-4 py-2.5 font-medium">Message</th>
              </tr></thead>
              <tbody>
                {data?.items?.map((l: any, i: number) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-elevated/30 transition-colors">
                    <td className="px-4 py-2 text-muted whitespace-nowrap">{formatDateFull(l.timestamp)}</td>
                    <td className="px-4 py-2"><Badge variant={levelVariant[l.level] || "default"}>{l.level}</Badge></td>
                    <td className="px-4 py-2 line-clamp-1">{l.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QueryView } from "@/components/feature/QueryView";

export default function LogsViewer() {
  const q = useQuery({ queryKey: ["admin-logs"], queryFn: async () => (await api.get<any[]>(endpoints.admin.logs)).data, refetchInterval: 5000 });
  return (
    <div>
      <PageHeader title="Logs" description="Streaming application logs." />
      <QueryView query={q} emptyCheck={(d) => d.length === 0}>
        {(items) => (
          <Card className="font-mono text-xs overflow-hidden">
            <div className="max-h-[70vh] overflow-y-auto scrollbar-thin">
              {items.map((l) => (
                <div key={l.id} className="px-4 py-1 border-b border-border flex gap-3">
                  <span className="text-muted shrink-0">{new Date(l.t).toISOString()}</span>
                  <Badge tone={l.level === "error" ? "danger" : l.level === "warn" ? "warning" : "neutral"}>{l.level}</Badge>
                  <span className="truncate">{l.msg}</span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </QueryView>
    </div>
  );
}

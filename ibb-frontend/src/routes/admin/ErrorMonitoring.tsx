import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QueryView } from "@/components/feature/QueryView";
import { formatDate } from "@/lib/utils";

export default function ErrorMonitoring() {
  const q = useQuery({ queryKey: ["admin-errors"], queryFn: async () => (await api.get<any[]>(endpoints.admin.errors)).data });
  return (
    <div>
      <PageHeader title="Error Monitoring" description="Recent unhandled exceptions across services." />
      <QueryView query={q} emptyCheck={(d) => d.length === 0}>
        {(items) => (
          <div className="space-y-2">
            {items.map((e) => (
              <Card key={e.id}><CardBody>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="danger">{e.level}</Badge>
                  <span className="text-xs text-muted">{e.service} · {formatDate(e.createdAt)}</span>
                </div>
                <p className="font-mono text-sm">{e.message}</p>
                {e.stack && <pre className="mt-2 text-xs text-muted overflow-x-auto bg-elevated rounded p-2">{e.stack}</pre>}
              </CardBody></Card>
            ))}
          </div>
        )}
      </QueryView>
    </div>
  );
}

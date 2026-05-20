import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { QueryView } from "@/components/feature/QueryView";
import { formatDate } from "@/lib/utils";
export default function ActivityHistory() {
  const q = useQuery({ queryKey: ["activity"], queryFn: async () => (await api.get<any[]>(endpoints.activity)).data });
  return (
    <div>
      <PageHeader title="Activity History" description="Audit log of every action in your workspace." />
      <QueryView query={q} emptyCheck={(d) => d.length === 0}>
        {(items) => (
          <Card><CardBody>
            <ul className="divide-y divide-border">
              {items.map((a) => (
                <li key={a.id} className="py-3">
                  <p className="text-sm">{a.action} <span className="text-muted">— {a.target}</span></p>
                  <p className="text-xs text-muted mt-0.5">{formatDate(a.createdAt)}</p>
                </li>
              ))}
            </ul>
          </CardBody></Card>
        )}
      </QueryView>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { QueryView } from "@/components/feature/QueryView";
import { formatDate } from "@/lib/utils";

export default function AIChatHistory() {
  const q = useQuery({ queryKey: ["ai-history"], queryFn: async () => (await api.get<any[]>(endpoints.ai.history)).data });
  return (
    <div>
      <PageHeader title="AI Chat History" description="Past conversations with the assistant." />
      <QueryView query={q} emptyCheck={(d) => d.length === 0}>
        {(items) => (
          <div className="space-y-2">
            {items.map((c) => (
              <Card key={c.id}><CardBody>
                <h3 className="font-medium">{c.title || "Untitled chat"}</h3>
                <p className="text-sm text-muted mt-1 line-clamp-2">{c.preview}</p>
                <p className="text-xs text-muted mt-2">{formatDate(c.createdAt)}</p>
              </CardBody></Card>
            ))}
          </div>
        )}
      </QueryView>
    </div>
  );
}

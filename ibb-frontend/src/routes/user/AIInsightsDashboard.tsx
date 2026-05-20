import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { QueryView } from "@/components/feature/QueryView";
import { Sparkles } from "lucide-react";

export default function AIInsightsDashboard() {
  const q = useQuery({ queryKey: ["ai-insights"], queryFn: async () => (await api.get<any[]>(endpoints.ai.insights)).data });
  return (
    <div>
      <PageHeader title="AI Insights" description="Auto-discovered patterns from your corpus." />
      <QueryView query={q} emptyCheck={(d) => d.length === 0}>
        {(items) => (
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((i) => (
              <Card key={i.id}><CardBody>
                <Sparkles className="h-5 w-5 text-brand mb-2" />
                <h3 className="font-display font-semibold">{i.title}</h3>
                <p className="text-sm text-muted mt-2">{i.description}</p>
                {i.confidence && <p className="text-xs text-muted mt-3">Confidence: {Math.round(i.confidence * 100)}%</p>}
              </CardBody></Card>
            ))}
          </div>
        )}
      </QueryView>
    </div>
  );
}

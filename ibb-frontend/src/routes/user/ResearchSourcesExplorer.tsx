import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QueryView } from "@/components/feature/QueryView";
import { ExternalLink } from "lucide-react";

export default function ResearchSourcesExplorer() {
  const q = useQuery({ queryKey: ["sources"], queryFn: async () => (await api.get<any[]>(endpoints.sources.list)).data });
  return (
    <div>
      <PageHeader title="Sources Explorer" description="Web sources, papers and citations linked from your analyses." />
      <QueryView query={q} emptyCheck={(d) => d.length === 0}>
        {(items) => (
          <div className="space-y-3">
            {items.map((s) => (
              <Card key={s.id}><CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={s.credibility >= 70 ? "success" : s.credibility >= 40 ? "warning" : "danger"}>Credibility {s.credibility}/100</Badge>
                      {s.similarity && <Badge>Similarity {Math.round(s.similarity * 100)}%</Badge>}
                    </div>
                    <h3 className="font-medium">{s.title}</h3>
                    <p className="text-sm text-muted mt-1">{s.snippet}</p>
                  </div>
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-brand"><ExternalLink className="h-4 w-4" /></a>
                </div>
              </CardBody></Card>
            ))}
          </div>
        )}
      </QueryView>
    </div>
  );
}

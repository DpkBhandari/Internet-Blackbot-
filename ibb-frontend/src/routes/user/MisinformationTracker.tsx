import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QueryView } from "@/components/feature/QueryView";

export default function MisinformationTracker() {
  const q = useQuery({ queryKey: ["misinformation"], queryFn: async () => (await api.get<any[]>(endpoints.analysis.misinformation)).data });
  return (
    <div>
      <PageHeader title="Misinformation Tracker" description="Flagged claims with credibility scoring and counter-evidence." />
      <QueryView query={q} emptyCheck={(d) => d.length === 0} emptyTitle="No flags yet">
        {(items) => (
          <div className="space-y-3">
            {items.map((m) => (
              <Card key={m.id}><CardBody>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge tone={m.score < 30 ? "danger" : m.score < 60 ? "warning" : "success"}>Credibility {m.score}/100</Badge>
                      {m.tags?.map((t: string) => <Badge key={t}>{t}</Badge>)}
                    </div>
                    <p className="font-medium">"{m.claim}"</p>
                    <p className="text-sm text-muted mt-2">{m.explanation}</p>
                    {m.sources && (
                      <ul className="mt-3 text-xs text-brand space-y-1">
                        {m.sources.map((s: any, i: number) => <li key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}
                      </ul>
                    )}
                  </div>
                </div>
              </CardBody></Card>
            ))}
          </div>
        )}
      </QueryView>
    </div>
  );
}

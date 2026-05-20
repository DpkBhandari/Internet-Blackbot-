import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QueryView } from "@/components/feature/QueryView";
import { Link } from "react-router-dom";

interface AnalysisItem {
  id: string; title: string; status: string; createdAt: string;
  sentiment?: { positive: number; neutral: number; negative: number };
  topics?: string[];
  credibility?: number;
}

export default function ContentAnalysis() {
  const { id } = useParams();
  if (id) return <Detail id={id} />;
  const list = useQuery({ queryKey: ["analyses"], queryFn: async () => (await api.get<AnalysisItem[]>(endpoints.analyses.list)).data });
  return (
    <div>
      <PageHeader title="Content Analysis" description="Detailed AI analysis of your uploaded documents." />
      <QueryView query={list} emptyCheck={(d) => d.length === 0} emptyTitle="No analyses yet">
        {(items) => (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((a) => (
              <Link key={a.id} to={`/app/analysis/${a.id}`}>
                <Card className="hover:border-brand transition-colors h-full">
                  <CardBody>
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant={a.status === "completed" ? "success" : "warning"}>{a.status}</Badge>
                      <span className="text-xs text-muted">{new Date(a.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-display font-semibold">{a.title}</h3>
                    {a.topics && <div className="flex flex-wrap gap-1 mt-3">{a.topics.slice(0,4).map(t => <Badge key={t}>{t}</Badge>)}</div>}
                  </CardBody>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </QueryView>
    </div>
  );
}

function Detail({ id }: { id: string }) {
  const q = useQuery({ queryKey: ["analysis", id], queryFn: async () => (await api.get<any>(endpoints.analyses.one(id))).data });
  return (
    <div>
      <PageHeader title="Analysis" description={`ID: ${id}`} />
      <QueryView query={q}>
        {(d) => (
          <div className="space-y-4">
            <Card><CardBody>
              <h3 className="font-display font-semibold mb-2">Summary</h3>
              <p className="text-sm leading-relaxed text-muted">{d.summary}</p>
            </CardBody></Card>
            {d.keywords && (
              <Card><CardBody>
                <h3 className="font-display font-semibold mb-3">Keywords</h3>
                <div className="flex flex-wrap gap-2">{d.keywords.map((k: string) => <Badge key={k} variant="brand">{k}</Badge>)}</div>
              </CardBody></Card>
            )}
            {d.entities && (
              <Card><CardBody>
                <h3 className="font-display font-semibold mb-3">Entities</h3>
                <ul className="text-sm text-muted space-y-1">{d.entities.map((e: any, i: number) => <li key={i}>{e.text} <span className="text-xs">({e.type})</span></li>)}</ul>
              </CardBody></Card>
            )}
          </div>
        )}
      </QueryView>
    </div>
  );
}

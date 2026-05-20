import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { QueryView } from "@/components/feature/QueryView";
import { Badge } from "@/components/ui/Badge";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function SourceCredibilityDashboard() {
  const q = useQuery({ queryKey: ["credibility"], queryFn: async () => (await api.get<any>(endpoints.analysis.credibility)).data });
  return (
    <div>
      <PageHeader title="Source Credibility" description="Domain reputation and citation patterns across your sources." />
      <QueryView query={q}>
        {(d) => (
          <div className="space-y-4">
            <Card><CardBody>
              <h3 className="font-display font-semibold mb-4">Credibility distribution</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={d.distribution}>
                  <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="bucket" stroke="rgb(var(--muted))" fontSize={12} />
                  <YAxis stroke="rgb(var(--muted))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))" }} />
                  <Bar dataKey="count" fill="rgb(var(--brand))" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody></Card>
            <Card><CardBody>
              <h3 className="font-display font-semibold mb-3">Top sources</h3>
              <ul className="divide-y divide-border">
                {d.topSources?.map((s: any) => (
                  <li key={s.domain} className="py-2 flex items-center justify-between">
                    <span className="text-sm">{s.domain}</span>
                    <Badge tone={s.score >= 70 ? "success" : s.score >= 40 ? "warning" : "danger"}>{s.score}</Badge>
                  </li>
                ))}
              </ul>
            </CardBody></Card>
          </div>
        )}
      </QueryView>
    </div>
  );
}

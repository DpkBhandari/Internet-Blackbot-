import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { QueryView } from "@/components/feature/QueryView";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TrendingUp } from "lucide-react";

export default function ViralTrends() {
  const q = useQuery({ queryKey: ["trends"], queryFn: async () => (await api.get<any>(endpoints.analysis.trends)).data });
  return (
    <div>
      <PageHeader title="Viral Trends" description="Detect emerging narratives and momentum in real time." />
      <QueryView query={q}>
        {(d) => (
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              {d.topTrends.map((t: any) => (
                <Card key={t.id}><CardBody>
                  <div className="flex items-center justify-between"><h4 className="font-semibold">{t.topic}</h4><TrendingUp className="h-4 w-4 text-brand" /></div>
                  <p className="text-2xl font-semibold mt-2">+{t.momentum}%</p>
                  <Badge tone={t.sentiment === "positive" ? "success" : t.sentiment === "negative" ? "danger" : "neutral"} className="mt-2">{t.sentiment}</Badge>
                </CardBody></Card>
              ))}
            </div>
            <Card><CardBody>
              <h3 className="font-display font-semibold mb-4">Trend velocity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={d.velocity}>
                  <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="time" stroke="rgb(var(--muted))" fontSize={12} />
                  <YAxis stroke="rgb(var(--muted))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))" }} />
                  <Line type="monotone" dataKey="value" stroke="rgb(var(--brand))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardBody></Card>
          </div>
        )}
      </QueryView>
    </div>
  );
}

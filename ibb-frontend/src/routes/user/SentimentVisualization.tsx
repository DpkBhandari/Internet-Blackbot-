import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { QueryView } from "@/components/feature/QueryView";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

export default function SentimentVisualization() {
  const q = useQuery({ queryKey: ["sentiment"], queryFn: async () => (await api.get<any>(endpoints.analysis.sentiment)).data });
  const COLORS = ["rgb(var(--success))", "rgb(var(--muted))", "rgb(var(--danger))"];
  return (
    <div>
      <PageHeader title="Sentiment Visualization" description="Real-time sentiment trends across your corpus." />
      <QueryView query={q}>
        {(d) => (
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardBody>
                <h3 className="font-display font-semibold mb-4">Sentiment over time</h3>
                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={d.series}>
                    <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="date" stroke="rgb(var(--muted))" fontSize={12} />
                    <YAxis stroke="rgb(var(--muted))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))" }} />
                    <Area type="monotone" dataKey="positive" stackId="1" stroke="rgb(var(--success))" fill="rgb(var(--success))" fillOpacity={0.4} />
                    <Area type="monotone" dataKey="neutral" stackId="1" stroke="rgb(var(--muted))" fill="rgb(var(--muted))" fillOpacity={0.4} />
                    <Area type="monotone" dataKey="negative" stackId="1" stroke="rgb(var(--danger))" fill="rgb(var(--danger))" fillOpacity={0.4} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
            <Card><CardBody>
              <h3 className="font-display font-semibold mb-4">Distribution</h3>
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie data={d.distribution} dataKey="value" nameKey="label" innerRadius={60} outerRadius={100}>
                    {d.distribution.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))" }} />
                </PieChart>
              </ResponsiveContainer>
            </CardBody></Card>
          </div>
        )}
      </QueryView>
    </div>
  );
}

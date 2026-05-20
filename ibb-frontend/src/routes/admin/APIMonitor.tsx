import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { QueryView } from "@/components/feature/QueryView";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function APIMonitor() {
  const q = useQuery({ queryKey: ["api-monitor"], queryFn: async () => (await api.get<any>(endpoints.admin.apiMonitor)).data, refetchInterval: 10_000 });
  return (
    <div>
      <PageHeader title="API Monitor" description="Live request rates, latency and error counts." />
      <QueryView query={q}>
        {(d) => (
          <div className="grid lg:grid-cols-2 gap-4">
            {(["requests","latency","errors","p95"] as const).map((k) => (
              <Card key={k}><CardBody>
                <h3 className="font-display font-semibold mb-4 capitalize">{k}</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={d[k] || []}>
                    <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" />
                    <XAxis dataKey="t" stroke="rgb(var(--muted))" fontSize={12} />
                    <YAxis stroke="rgb(var(--muted))" fontSize={12} />
                    <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))" }} />
                    <Line type="monotone" dataKey="v" stroke="rgb(var(--brand))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody></Card>
            ))}
          </div>
        )}
      </QueryView>
    </div>
  );
}

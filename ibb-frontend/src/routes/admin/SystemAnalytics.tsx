import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { QueryView } from "@/components/feature/QueryView";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from "recharts";

export default function SystemAnalytics() {
  const q = useQuery({ queryKey: ["system-analytics"], queryFn: async () => (await api.get<any>(endpoints.admin.analytics)).data });
  return (
    <div>
      <PageHeader title="System Analytics" description="Platform-wide usage and growth." />
      <QueryView query={q}>
        {(d) => (
          <div className="grid lg:grid-cols-2 gap-4">
            <Card><CardBody>
              <h3 className="font-display font-semibold mb-4">Active users</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={d.activeUsers}>
                  <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="rgb(var(--muted))" fontSize={12} />
                  <YAxis stroke="rgb(var(--muted))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))" }} />
                  <Line type="monotone" dataKey="value" stroke="rgb(var(--brand))" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </CardBody></Card>
            <Card><CardBody>
              <h3 className="font-display font-semibold mb-4">Uploads by type</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={d.uploadsByType}>
                  <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="type" stroke="rgb(var(--muted))" fontSize={12} />
                  <YAxis stroke="rgb(var(--muted))" fontSize={12} />
                  <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))" }} />
                  <Bar dataKey="count" fill="rgb(var(--brand))" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody></Card>
          </div>
        )}
      </QueryView>
    </div>
  );
}

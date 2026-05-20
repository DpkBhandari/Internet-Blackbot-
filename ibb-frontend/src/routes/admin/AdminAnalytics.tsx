import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

const COLORS = ["rgb(var(--brand))", "rgb(var(--success))", "rgb(var(--warning))", "rgb(var(--danger))"];

export default function AdminAnalytics() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-analytics"],
    queryFn: async () => (await api.get("/admin/analytics")).data,
  });
  return (
    <div>
      <PageHeader title="Platform Analytics" description="User growth and analysis pipeline metrics." />
      {isLoading ? <div className="grid lg:grid-cols-2 gap-4"><SkeletonCard /><SkeletonCard /></div> : (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <CardBody>
              <CardTitle className="mb-4">User registrations</CardTitle>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data?.usersByDay || []}>
                  <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="_id" stroke="rgb(var(--muted))" fontSize={11} tickLine={false} />
                  <YAxis stroke="rgb(var(--muted))" fontSize={11} tickLine={false} />
                  <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="rgb(var(--brand))" radius={[4,4,0,0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
          <Card>
            <CardBody>
              <CardTitle className="mb-4">Analysis by status</CardTitle>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={data?.analysisByStatus || []} dataKey="count" nameKey="_id" cx="50%" cy="50%" outerRadius={80} label={({ _id, percent }) => `${_id} ${(percent*100).toFixed(0)}%`}>
                    {(data?.analysisByStatus || []).map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </div>
      )}
    </div>
  );
}

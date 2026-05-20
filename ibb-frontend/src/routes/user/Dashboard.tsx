import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, LineChart, Line
} from "recharts";
import {
  FileText, Upload, Brain, AlertTriangle, Plus, ArrowRight,
  TrendingUp, Activity, FileCheck, BarChart3
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } };
const itemV     = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } };

const STATUS_VARIANT: Record<string, "success" | "warning" | "danger" | "default"> = {
  READY: "success", PROCESSING: "warning", FAILED: "danger", PENDING: "default",
};

const STATS = [
  { key: "uploads",   label: "Uploads",    Icon: Upload,        color: "text-brand",   bg: "bg-brand/10"   },
  { key: "analyses",  label: "Analyses",   Icon: BarChart3,     color: "text-success", bg: "bg-success/10" },
  { key: "reports",   label: "Reports",    Icon: FileCheck,     color: "text-accent",  bg: "bg-accent/10"  },
  { key: "aiQueries", label: "AI Queries", Icon: Brain,         color: "text-warning", bg: "bg-warning/10" },
  { key: "flags",     label: "Flags",      Icon: AlertTriangle, color: "text-danger",  bg: "bg-danger/10"  },
] as const;

export default function Dashboard() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: async () => (await api.get("/dashboard")).data,
    refetchInterval: 30_000,
  });

  if (isLoading) return (
    <div>
      <PageHeader title="Dashboard" />
      <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">{[...Array(5)].map((_, i) => <SkeletonCard key={i} />)}</div>
      <div className="grid lg:grid-cols-2 gap-4"><SkeletonCard /><SkeletonCard /></div>
    </div>
  );

  if (error) return <div><PageHeader title="Dashboard" /><ErrorState message="Failed to load dashboard" onRetry={refetch} /></div>;

  return (
    <div>
      <PageHeader title="Dashboard" description="Your research workspace overview."
        actions={<Link to="/app/upload"><Button size="sm" icon={<Plus className="h-4 w-4" />}>Upload</Button></Link>} />

      {/* Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {STATS.map(({ key, label, Icon, color, bg }) => (
          <motion.div key={key} variants={itemV}>
            <Card className="hover:border-brand/30 hover:-translate-y-0.5 transition-all duration-200">
              <CardBody className="flex items-center gap-3">
                <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", bg)}>
                  <Icon className={cn("h-5 w-5", color)} />
                </div>
                <div>
                  <p className="text-xs text-muted">{label}</p>
                  <p className="text-2xl font-bold font-display count-up">{(data?.stats?.[key] ?? 0).toLocaleString()}</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardBody>
              <CardTitle className="mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-brand" /> Sentiment Over Time</CardTitle>
              {data?.sentimentSeries?.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={data.sentimentSeries} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <defs>
                      <linearGradient id="gpos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="gneg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" stroke="rgb(var(--muted))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgb(var(--muted))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Area type="monotone" dataKey="positive" stroke="#10b981" strokeWidth={2} fill="url(#gpos)" dot={false} />
                    <Area type="monotone" dataKey="negative" stroke="#ef4444" strokeWidth={2} fill="url(#gneg)" dot={false} />
                    <Line type="monotone" dataKey="neutral" stroke="rgb(var(--muted))" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-56 flex flex-col items-center justify-center gap-3 text-sm text-muted">
                  <TrendingUp className="h-8 w-8 opacity-30" />
                  <span>No sentiment data yet — <Link to="/app/upload" className="text-brand hover:underline">upload a document</Link></span>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardBody>
              <CardTitle className="mb-4">Top Topics</CardTitle>
              {data?.topicVolume?.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.topicVolume} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                    <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="topic" stroke="rgb(var(--muted))" fontSize={11} tickLine={false} axisLine={false} />
                    <YAxis stroke="rgb(var(--muted))" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="rgb(var(--brand))" radius={[5, 5, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-56 flex flex-col items-center justify-center gap-3 text-sm text-muted">
                  <BarChart3 className="h-8 w-8 opacity-30" />
                  <span>Topics appear after analysis completes</span>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Recent */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4 text-brand" /> Recent Activity</CardTitle>
            <Link to="/app/activity"><Button variant="ghost" size="xs" icon={<ArrowRight className="h-3.5 w-3.5" />}>View all</Button></Link>
          </div>
          <CardBody className="p-0">
            {data?.recent?.length ? (
              <ul className="divide-y divide-border">
                {data.recent.map((r: any, i: number) => (
                  <motion.li key={r.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.04 }}
                    className="px-5 py-3.5 flex items-center justify-between gap-4 hover:bg-elevated/40 transition-colors">
                    <div className="min-w-0">
                      <Link to={`/app/analysis/${r.id}`} className="font-medium text-sm hover:text-brand transition-colors line-clamp-1">{r.title}</Link>
                      <p className="text-xs text-muted mt-0.5">{r.type} · {formatDate(r.createdAt)}</p>
                    </div>
                    <Badge variant={STATUS_VARIANT[r.status] ?? "default"} dot pulse={r.status === "PROCESSING"}>{r.status}</Badge>
                  </motion.li>
                ))}
              </ul>
            ) : (
              <div className="py-12 text-center text-sm text-muted">
                No activity yet. <Link to="/app/upload" className="text-brand hover:underline">Upload your first document</Link>
              </div>
            )}
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { Badge } from "@/components/ui/Badge";
import { Smile, Frown, Meh, TrendingUp, Activity } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar, PieChart, Pie, Cell
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = { positive: "#10b981", neutral: "#6366f1", negative: "#ef4444" };

export default function SentimentPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["sentiment-page"],
    queryFn: async () => (await api.get("/analyses?status=READY&limit=50")).data,
  });

  if (isLoading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;

  const items = data?.items?.filter((a: any) => a.status === "READY") ?? [];

  if (!items.length) return (
    <div>
      <PageHeader title="Sentiment Analysis" description="Emotional tone intelligence across your research corpus." />
      <Empty icon={<Activity className="h-7 w-7 text-muted" />} title="No analyses yet" description="Upload and analyze documents to see sentiment data." />
    </div>
  );

  // Aggregate sentiment
  const counts = { positive: 0, neutral: 0, negative: 0 };
  items.forEach((a: any) => {
    const l = a.sentiment?.label?.toLowerCase() ?? "neutral";
    if (l in counts) counts[l as keyof typeof counts]++;
  });
  const total = items.length || 1;

  const pieData = [
    { name: "Positive", value: counts.positive, fill: COLORS.positive },
    { name: "Neutral", value: counts.neutral, fill: COLORS.neutral },
    { name: "Negative", value: counts.negative, fill: COLORS.negative },
  ];

  // Timeline series
  const timeline = items.slice(-14).map((a: any, i: number) => ({
    i: i + 1,
    positive: a.sentiment?.label === "positive" ? Math.round((a.sentiment?.score ?? 0.5) * 100) : 0,
    neutral: a.sentiment?.label === "neutral" ? Math.round((a.sentiment?.score ?? 0.5) * 100) : 0,
    negative: a.sentiment?.label === "negative" ? Math.round((a.sentiment?.score ?? 0.5) * 100) : 0,
    label: (a.research?.title ?? "Doc").slice(0, 12),
  }));

  const avgScore = items.reduce((s: number, a: any) => s + (a.sentiment?.score ?? 0.5), 0) / total;

  return (
    <div>
      <PageHeader title="Sentiment Analysis" description="Emotional tone intelligence across your research corpus." badge={<Badge variant="brand">{items.length} documents</Badge>} />

      {/* Score cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Positive", count: counts.positive, pct: Math.round(counts.positive / total * 100), icon: Smile, color: "text-success", bg: "bg-success/10" },
          { label: "Neutral", count: counts.neutral, pct: Math.round(counts.neutral / total * 100), icon: Meh, color: "text-brand", bg: "bg-brand/10" },
          { label: "Negative", count: counts.negative, pct: Math.round(counts.negative / total * 100), icon: Frown, color: "text-danger", bg: "bg-danger/10" },
          { label: "Avg Confidence", count: `${Math.round(avgScore * 100)}%`, pct: Math.round(avgScore * 100), icon: TrendingUp, color: "text-accent", bg: "bg-accent/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <Card className="hover:border-brand/30 transition-all">
              <CardBody className="flex items-center gap-3">
                <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
                  <s.icon className={cn("h-5 w-5", s.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted">{s.label}</p>
                  <p className="text-2xl font-bold font-display">{s.count}</p>
                  <p className="text-xs text-muted">{typeof s.count !== "string" ? `${s.pct}%` : "confidence"}</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-5">
        {/* Pie */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardBody>
              <CardTitle className="mb-3">Distribution</CardTitle>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={4} dataKey="value">
                    {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 mt-2">
                {pieData.map(d => (
                  <span key={d.name} className="flex items-center gap-1.5 text-xs text-muted">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.fill }} />
                    {d.name} ({d.value})
                  </span>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Timeline */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <CardBody>
              <CardTitle className="mb-3">Sentiment Timeline</CardTitle>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={timeline} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <defs>
                    {[["pos", "#10b981"], ["neu", "#6366f1"], ["neg", "#ef4444"]].map(([id, color]) => (
                      <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={color} stopOpacity={0.3} />
                        <stop offset="95%" stopColor={color} stopOpacity={0} />
                      </linearGradient>
                    ))}
                  </defs>
                  <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="label" stroke="rgb(var(--muted))" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgb(var(--muted))" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="positive" stroke={COLORS.positive} strokeWidth={2} fill="url(#pos)" dot={false} />
                  <Area type="monotone" dataKey="neutral" stroke={COLORS.neutral} strokeWidth={2} fill="url(#neu)" dot={false} />
                  <Area type="monotone" dataKey="negative" stroke={COLORS.negative} strokeWidth={2} fill="url(#neg)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Document list */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card>
          <div className="px-5 py-3.5 border-b border-border"><CardTitle>Document Sentiment</CardTitle></div>
          <div className="divide-y divide-border">
            {items.map((a: any, i: number) => {
              const label = a.sentiment?.label ?? "neutral";
              const score = Math.round((a.sentiment?.score ?? 0.5) * 100);
              const color = label === "positive" ? "text-success" : label === "negative" ? "text-danger" : "text-brand";
              const barColor = label === "positive" ? "bg-success" : label === "negative" ? "bg-danger" : "bg-brand";
              return (
                <motion.div key={a._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.45 + i * 0.04 }}
                  className="px-5 py-3.5 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{a.research?.title || a.research?.fileName || "Document"}</p>
                    <p className="text-xs text-muted mt-0.5">{a.summary?.slice(0, 80) || "No summary"}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="w-24">
                      <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${score}%` }} />
                      </div>
                    </div>
                    <span className={cn("text-sm font-semibold capitalize w-20 text-right", color)}>{label} {score}%</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

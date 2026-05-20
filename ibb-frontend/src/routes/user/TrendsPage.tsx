import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { Badge } from "@/components/ui/Badge";
import { TrendingUp, Hash, Zap, BarChart2 } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Treemap
} from "recharts";
import { cn } from "@/lib/utils";

const HEAT_COLORS = ["#312e81","#4338ca","#6366f1","#818cf8","#a5b4fc","#c7d2fe"];

export default function TrendsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["trends-page"],
    queryFn: async () => (await api.get("/analyses?status=READY&limit=50")).data,
  });

  if (isLoading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;

  const items = data?.items?.filter((a: any) => a.status === "READY" && a.keywords?.length) ?? [];

  if (!items.length) return (
    <div>
      <PageHeader title="Viral Trends" description="Trending keywords, topics, and emerging narratives." />
      <Empty icon={<TrendingUp className="h-7 w-7 text-muted" />} title="No trend data" description="Upload documents to discover trending topics." />
    </div>
  );

  // Aggregate keyword frequencies
  const kwMap: Record<string, number> = {};
  items.forEach((a: any) => {
    (a.keywords ?? []).forEach((k: string) => {
      kwMap[k] = (kwMap[k] ?? 0) + 1;
    });
  });
  const sorted = Object.entries(kwMap).sort((a, b) => b[1] - a[1]);
  const top20 = sorted.slice(0, 20).map(([name, count]) => ({ name, count }));
  const treemapData = sorted.slice(0, 40).map(([name, count]) => ({ name, size: count }));

  return (
    <div>
      <PageHeader title="Viral Trends" description="Trending keywords, entities, and emerging narratives from your research corpus."
        badge={<Badge variant="brand">{sorted.length} unique terms</Badge>} />

      {/* Top 3 trending */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {top20.slice(0, 3).map((k, i) => (
          <motion.div key={k.name} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card className="border-brand/20 bg-brand/5">
              <CardBody className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-brand/20 text-brand flex items-center justify-center font-bold text-lg font-display">
                  #{i + 1}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate capitalize">{k.name}</p>
                  <p className="text-xs text-muted">{k.count} document{k.count !== 1 ? "s" : ""}</p>
                </div>
                <Zap className="h-4 w-4 text-warning shrink-0 ml-auto" />
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-5">
        {/* Bar chart */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardBody>
              <CardTitle className="mb-3 flex items-center gap-2"><BarChart2 className="h-4 w-4 text-brand" /> Top Keywords by Frequency</CardTitle>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={top20.slice(0, 12)} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgb(var(--border))" />
                  <XAxis type="number" stroke="rgb(var(--muted))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="rgb(var(--muted))" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="rgb(var(--brand))" radius={[0, 5, 5, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        {/* Topic heatmap as treemap */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardBody>
              <CardTitle className="mb-3 flex items-center gap-2"><Hash className="h-4 w-4 text-accent" /> Topic Heatmap</CardTitle>
              <ResponsiveContainer width="100%" height={280}>
                <Treemap data={treemapData} dataKey="size" aspectRatio={4/3}
                  content={({ x, y, width, height, name, value }: any) => {
                    const idx = Math.min(Math.floor((value / (sorted[0]?.[1] || 1)) * HEAT_COLORS.length), HEAT_COLORS.length - 1);
                    return (
                      <g>
                        <rect x={x} y={y} width={width} height={height} fill={HEAT_COLORS[idx]} rx={4} stroke="rgb(var(--bg))" strokeWidth={2} />
                        {width > 40 && height > 20 && (
                          <text x={x + width / 2} y={y + height / 2} textAnchor="middle" dominantBaseline="central" fontSize={Math.min(12, width / 5)} fill="#fff" fontWeight={500}>
                            {name}
                          </text>
                        )}
                      </g>
                    );
                  }}
                />
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Full keyword grid */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card>
          <div className="px-5 py-3.5 border-b border-border"><CardTitle>All Trending Terms</CardTitle></div>
          <CardBody>
            <div className="flex flex-wrap gap-2">
              {sorted.map(([kw, count], i) => {
                const size = count >= 5 ? "text-base" : count >= 3 ? "text-sm" : "text-xs";
                const weight = count >= 5 ? "font-bold" : count >= 3 ? "font-semibold" : "font-medium";
                const opacity = Math.max(0.4, Math.min(1, count / (sorted[0]?.[1] || 1)));
                return (
                  <motion.span key={kw} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.45 + i * 0.01 }}
                    className={cn("px-2.5 py-1 rounded-full border border-brand/20 bg-brand/5 text-brand capitalize cursor-default hover:bg-brand/15 transition-colors", size, weight)}
                    style={{ opacity }}>
                    {kw} <span className="text-muted font-normal">×{count}</span>
                  </motion.span>
                );
              })}
            </div>
          </CardBody>
        </Card>
      </motion.div>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink, Globe, Shield, Star, Calendar } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { cn, scoreColor, pct } from "@/lib/utils";

export default function SourcesPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["sources-page"],
    queryFn: async () => (await api.get("/analyses?status=READY&limit=50")).data,
  });

  if (isLoading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;

  const items = data?.items?.filter((a: any) => a.status === "READY") ?? [];
  const allSources = items.flatMap((a: any) => (a.sources ?? []));

  if (!allSources.length) return (
    <div>
      <PageHeader title="Sources" description="Extracted references, domain authority, and trust scores." />
      <Empty icon={<Globe className="h-7 w-7 text-muted" />} title="No sources extracted" description="Analyze documents with internet research enabled to see sources." />
    </div>
  );

  // Domain aggregation
  const domainMap: Record<string, { count: number; avgCred: number }> = {};
  allSources.forEach((s: any) => {
    const d = s.domain ?? "unknown";
    if (!domainMap[d]) domainMap[d] = { count: 0, avgCred: 0 };
    domainMap[d].count++;
    domainMap[d].avgCred += s.credibilityScore ?? 0.5;
  });
  const domains = Object.entries(domainMap)
    .map(([name, v]) => ({ name, count: v.count, avgCred: Math.round((v.avgCred / v.count) * 100) }))
    .sort((a, b) => b.count - a.count).slice(0, 10);

  const highTrust = allSources.filter((s: any) => (s.credibilityScore ?? 0) >= 0.7).length;
  const avgCred = allSources.reduce((s: number, x: any) => s + (x.credibilityScore ?? 0.5), 0) / allSources.length;

  return (
    <div>
      <PageHeader title="Sources" description="Extracted references, domain authority, and source trust scoring."
        badge={<Badge variant="brand">{allSources.length} sources</Badge>} />

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Total Sources", val: allSources.length, icon: Globe, color: "text-brand", bg: "bg-brand/10" },
          { label: "High Trust", val: highTrust, icon: Shield, color: "text-success", bg: "bg-success/10" },
          { label: "Avg Trust Score", val: `${Math.round(avgCred * 100)}%`, icon: Star, color: "text-warning", bg: "bg-warning/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <CardBody className="flex items-center gap-3">
                <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
                  <s.icon className={cn("h-5 w-5", s.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted">{s.label}</p>
                  <p className="text-2xl font-bold font-display">{s.val}</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardBody>
              <CardTitle className="mb-3">Top Domains by Citations</CardTitle>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={domains} layout="vertical" margin={{ top: 0, right: 20, bottom: 0, left: 70 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgb(var(--border))" />
                  <XAxis type="number" stroke="rgb(var(--muted))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" stroke="rgb(var(--muted))" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="rgb(var(--brand))" radius={[0, 5, 5, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card>
            <CardBody>
              <CardTitle className="mb-3">Domain Trust Scores</CardTitle>
              <div className="space-y-3 max-h-60 overflow-y-auto scrollbar-thin">
                {domains.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-3">
                    <span className="text-xs text-muted w-4">{i + 1}</span>
                    <span className="text-sm font-medium flex-1 truncate font-mono">{d.name}</span>
                    <div className="w-20 h-1.5 bg-elevated rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", d.avgCred >= 70 ? "bg-success" : d.avgCred >= 40 ? "bg-warning" : "bg-danger")}
                        style={{ width: `${d.avgCred}%` }} />
                    </div>
                    <span className={cn("text-xs font-mono w-10 text-right", d.avgCred >= 70 ? "text-success" : d.avgCred >= 40 ? "text-warning" : "text-danger")}>
                      {d.avgCred}%
                    </span>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card>
          <div className="px-5 py-3.5 border-b border-border"><CardTitle>All Sources</CardTitle></div>
          <div className="divide-y divide-border max-h-96 overflow-y-auto scrollbar-thin">
            {allSources.slice(0, 30).map((s: any, i: number) => {
              const cred = s.credibilityScore ?? 0.5;
              return (
                <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.45 + i * 0.02 }}
                  className="px-5 py-3.5 flex items-start gap-4 hover:bg-elevated/40 transition-colors">
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold",
                    cred >= 0.7 ? "bg-success/15 text-success" : cred >= 0.4 ? "bg-warning/15 text-warning" : "bg-danger/15 text-danger")}>
                    {Math.round(cred * 100)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <a href={s.url} target="_blank" rel="noreferrer"
                      className="text-sm font-medium text-brand hover:underline flex items-center gap-1 line-clamp-1">
                      {s.title || s.url || "Source"} <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                    {s.snippet && <p className="text-xs text-muted mt-0.5 line-clamp-2">{s.snippet}</p>}
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      {s.domain && <span className="text-xs text-muted font-mono">{s.domain}</span>}
                      {s.sourceType && <Badge variant="default" className="text-[10px]">{s.sourceType}</Badge>}
                    </div>
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

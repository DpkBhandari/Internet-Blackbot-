import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, Award, TrendingUp, AlertOctagon } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ZAxis } from "recharts";
import { cn } from "@/lib/utils";

function CredMeter({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = score >= 0.7 ? "#10b981" : score >= 0.4 ? "#f59e0b" : "#ef4444";
  const label = score >= 0.7 ? "Trustworthy" : score >= 0.4 ? "Moderate" : "Low Trust";
  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <div className="relative h-32 w-32">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(var(--border))" strokeWidth="8" />
          <circle cx="50" cy="50" r="42" fill="none" stroke={color}
            strokeWidth="8" strokeDasharray={`${pct * 2.638} 263.8`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <ShieldCheck className="h-5 w-5 mb-1" style={{ color }} />
          <span className="text-2xl font-bold font-display" style={{ color }}>{pct}%</span>
        </div>
      </div>
      <span className="text-sm font-semibold" style={{ color }}>{label}</span>
    </div>
  );
}

export default function CredibilityPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["credibility-page"],
    queryFn: async () => (await api.get("/analyses?status=READY&limit=50")).data,
  });

  if (isLoading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  const items = data?.items?.filter((a: any) => a.status === "READY") ?? [];

  if (!items.length) return (
    <div>
      <PageHeader title="Credibility Scoring" />
      <Empty icon={<ShieldCheck className="h-7 w-7 text-muted" />} title="No data" description="Analyze documents to see credibility scores." />
    </div>
  );

  const avgCred = items.reduce((s: number, a: any) => s + (a.credibilityScore ?? 0.5), 0) / items.length;
  const avgMisinfo = items.reduce((s: number, a: any) => s + (a.misinformationScore ?? 0), 0) / items.length;
  const high = items.filter((a: any) => (a.credibilityScore ?? 0) >= 0.7).length;
  const low = items.filter((a: any) => (a.credibilityScore ?? 0) < 0.4).length;

  const radarData = [
    { axis: "Credibility", val: Math.round(avgCred * 100) },
    { axis: "Accuracy", val: Math.round((1 - avgMisinfo) * 100) },
    { axis: "Consistency", val: Math.round((avgCred * 0.8 + 0.1) * 100) },
    { axis: "Source Quality", val: Math.round(avgCred * 90) },
    { axis: "Language", val: Math.round((1 - avgMisinfo * 0.6) * 100) },
    { axis: "Citations", val: Math.round(avgCred * 85) },
  ];

  const scatter = items.map((a: any) => ({
    x: Math.round((a.credibilityScore ?? 0.5) * 100),
    y: Math.round((a.misinformationScore ?? 0) * 100),
    z: (a.metrics?.wordCount ?? 100) / 100,
    name: (a.research?.title ?? "Doc").slice(0, 20),
  }));

  return (
    <div>
      <PageHeader title="Credibility Scoring" description="Trust scores, source reliability, and manipulation detection."
        badge={<Badge variant={avgCred >= 0.7 ? "success" : avgCred >= 0.4 ? "warning" : "danger"}>
          Avg {Math.round(avgCred * 100)}%
        </Badge>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Corpus Credibility", val: `${Math.round(avgCred * 100)}%`, icon: ShieldCheck, color: "text-success", bg: "bg-success/10" },
          { label: "High Trust Docs", val: high, icon: Award, color: "text-brand", bg: "bg-brand/10" },
          { label: "Low Trust Docs", val: low, icon: AlertOctagon, color: "text-danger", bg: "bg-danger/10" },
          { label: "Avg Misinfo Risk", val: `${Math.round(avgMisinfo * 100)}%`, icon: TrendingUp, color: "text-warning", bg: "bg-warning/10" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
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

      <div className="grid lg:grid-cols-3 gap-4 mb-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardBody className="flex flex-col items-center">
              <CardTitle className="mb-2 self-start">Corpus Trust Meter</CardTitle>
              <CredMeter score={avgCred} />
              <p className="text-xs text-muted text-center mt-2 max-w-[180px]">
                Based on {items.length} analyzed document{items.length !== 1 ? "s" : ""}
              </p>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <CardBody>
              <CardTitle className="mb-2">Trust Radar</CardTitle>
              <ResponsiveContainer width="100%" height={210}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgb(var(--border))" />
                  <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: "rgb(var(--muted))" }} />
                  <Radar dataKey="val" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardBody>
              <CardTitle className="mb-2">Credibility vs Risk</CardTitle>
              <ResponsiveContainer width="100%" height={210}>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                  <CartesianGrid stroke="rgb(var(--border))" strokeDasharray="3 3" />
                  <XAxis dataKey="x" name="Credibility" unit="%" stroke="rgb(var(--muted))" fontSize={10} tickLine={false} />
                  <YAxis dataKey="y" name="Misinfo Risk" unit="%" stroke="rgb(var(--muted))" fontSize={10} tickLine={false} />
                  <ZAxis dataKey="z" range={[40, 200]} />
                  <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(val: any, name: string) => [`${val}%`, name]} />
                  <Scatter data={scatter} fill="rgb(var(--brand))" fillOpacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <div className="px-5 py-3.5 border-b border-border"><CardTitle>Document Credibility Rankings</CardTitle></div>
          <div className="divide-y divide-border">
            {[...items].sort((a: any, b: any) => (b.credibilityScore ?? 0) - (a.credibilityScore ?? 0)).map((a: any, i: number) => {
              const score = a.credibilityScore ?? 0.5;
              const color = score >= 0.7 ? "bg-success" : score >= 0.4 ? "bg-warning" : "bg-danger";
              const badge = score >= 0.7 ? "success" : score >= 0.4 ? "warning" : "danger";
              return (
                <motion.div key={a._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.04 }}
                  className="px-5 py-3.5 flex items-center gap-4">
                  <span className="text-xs text-muted font-mono w-6">#{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{a.research?.title ?? a.research?.fileName ?? "Document"}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 w-32 bg-elevated rounded-full overflow-hidden">
                        <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.round(score * 100)}%` }} />
                      </div>
                      <span className="text-xs text-muted">{Math.round(score * 100)}%</span>
                    </div>
                  </div>
                  <Badge variant={badge as any}>{score >= 0.7 ? "High Trust" : score >= 0.4 ? "Moderate" : "Low Trust"}</Badge>
                </motion.div>
              );
            })}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

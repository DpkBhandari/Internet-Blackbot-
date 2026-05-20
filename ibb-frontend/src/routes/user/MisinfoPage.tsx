import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { Badge } from "@/components/ui/Badge";
import { AlertTriangle, ShieldCheck, ShieldAlert, ShieldX, Gauge } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";
import { cn, pct, scoreColor } from "@/lib/utils";

function RiskMeter({ score }: { score: number }) {
  const pctVal = Math.round(score * 100);
  const color = score < 0.3 ? "text-success" : score < 0.6 ? "text-warning" : "text-danger";
  const label = score < 0.3 ? "Low Risk" : score < 0.6 ? "Medium Risk" : "High Risk";
  const Icon = score < 0.3 ? ShieldCheck : score < 0.6 ? ShieldAlert : ShieldX;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative h-28 w-28">
        <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgb(var(--border))" strokeWidth="10" />
          <circle cx="50" cy="50" r="40" fill="none" stroke={score < 0.3 ? "#10b981" : score < 0.6 ? "#f59e0b" : "#ef4444"}
            strokeWidth="10" strokeDasharray={`${pctVal * 2.51} 251`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Icon className={cn("h-5 w-5", color)} />
          <span className={cn("text-lg font-bold font-display", color)}>{pctVal}%</span>
        </div>
      </div>
      <span className={cn("text-sm font-semibold", color)}>{label}</span>
    </div>
  );
}

export default function MisinfoPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["misinfo-page"],
    queryFn: async () => (await api.get("/analyses?status=READY&limit=50")).data,
  });

  if (isLoading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;

  const items = data?.items?.filter((a: any) => a.status === "READY") ?? [];
  if (!items.length) return (
    <div>
      <PageHeader title="Misinformation Tracker" description="Detect suspicious claims, manipulated wording, and credibility issues." />
      <Empty icon={<AlertTriangle className="h-7 w-7 text-muted" />} title="No data" description="Upload documents to run misinformation analysis." />
    </div>
  );

  const avgMisinfo = items.reduce((s: number, a: any) => s + (a.misinformationScore ?? 0), 0) / items.length;
  const avgCred = items.reduce((s: number, a: any) => s + (a.credibilityScore ?? 0.5), 0) / items.length;
  const flagged = items.filter((a: any) => (a.misinformationScore ?? 0) >= 0.5);
  const allClaims = items.flatMap((a: any) => (a.claims ?? []).map((c: any) => ({ ...c, docTitle: a.research?.title ?? "Doc" })));

  const radarData = [
    { metric: "Credibility", value: Math.round(avgCred * 100) },
    { metric: "Accuracy", value: Math.round((1 - avgMisinfo) * 80 + 10) },
    { metric: "Source Quality", value: Math.round(avgCred * 90) },
    { metric: "Language", value: Math.round((1 - avgMisinfo * 0.5) * 100) },
    { metric: "Consistency", value: Math.round((1 - avgMisinfo * 0.7) * 100) },
  ];

  return (
    <div>
      <PageHeader title="Misinformation Tracker" description="Suspicious claims, credibility indicators, and risk scoring."
        badge={flagged.length > 0 ? <Badge variant="danger">{flagged.length} flagged</Badge> : <Badge variant="success">All clear</Badge>} />

      {/* Summary row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Avg Misinfo Risk", val: `${Math.round(avgMisinfo * 100)}%`, icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10" },
          { label: "Avg Credibility", val: `${Math.round(avgCred * 100)}%`, icon: ShieldCheck, color: "text-success", bg: "bg-success/10" },
          { label: "Flagged Docs", val: flagged.length, icon: ShieldX, color: "text-warning", bg: "bg-warning/10" },
          { label: "Claims Found", val: allClaims.length, icon: Gauge, color: "text-brand", bg: "bg-brand/10" },
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
        {/* Radar */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardBody>
              <CardTitle className="mb-3">Corpus Health Radar</CardTitle>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgb(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10, fill: "rgb(var(--muted))" }} />
                  <Radar dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        {/* Per-doc risk list */}
        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <CardBody>
              <CardTitle className="mb-3">Document Risk Scores</CardTitle>
              <div className="space-y-3">
                {items.slice(0, 8).map((a: any, i: number) => {
                  const ms = a.misinformationScore ?? 0;
                  const label = ms < 0.3 ? { text: "Low Risk", cls: "success" } : ms < 0.6 ? { text: "Medium", cls: "warning" } : { text: "High Risk", cls: "danger" };
                  return (
                    <motion.div key={a._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.35 + i * 0.05 }}
                      className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{a.research?.title ?? "Document"}</p>
                        <div className="h-1.5 bg-elevated rounded-full mt-1 overflow-hidden">
                          <div className={cn("h-full rounded-full", ms < 0.3 ? "bg-success" : ms < 0.6 ? "bg-warning" : "bg-danger")}
                            style={{ width: `${Math.round(ms * 100)}%` }} />
                        </div>
                      </div>
                      <Badge variant={label.cls as any}>{label.text}</Badge>
                      <span className="text-xs font-mono text-muted w-10 text-right">{Math.round(ms * 100)}%</span>
                    </motion.div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Claims */}
      {allClaims.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card>
            <div className="px-5 py-3.5 border-b border-border"><CardTitle>Extracted Claims ({allClaims.length})</CardTitle></div>
            <div className="divide-y divide-border max-h-80 overflow-y-auto scrollbar-thin">
              {allClaims.slice(0, 20).map((c: any, i: number) => (
                <div key={i} className="px-5 py-3 flex items-start gap-3">
                  <Badge variant={c.verdict === "TRUE" ? "success" : c.verdict === "FALSE" ? "danger" : "warning"} className="shrink-0 mt-0.5">
                    {c.verdict ?? "UNVERIFIED"}
                  </Badge>
                  <div className="min-w-0">
                    <p className="text-sm">{c.text}</p>
                    <p className="text-xs text-muted mt-0.5">from: {c.docTitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

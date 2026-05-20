import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { Badge } from "@/components/ui/Badge";
import { ShieldCheck, ShieldX, HelpCircle, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

const VERDICT_CONFIG: Record<string, { label: string; color: string; bg: string; icon: any; variant: any }> = {
  TRUE:       { label: "Verified True",   color: "text-success", bg: "bg-success/10", icon: CheckCircle2, variant: "success" },
  FALSE:      { label: "Verified False",  color: "text-danger",  bg: "bg-danger/10",  icon: XCircle,      variant: "danger"  },
  MISLEADING: { label: "Misleading",      color: "text-warning", bg: "bg-warning/10", icon: AlertTriangle, variant: "warning" },
  UNVERIFIED: { label: "Unverified",      color: "text-muted",   bg: "bg-elevated",   icon: HelpCircle,   variant: "default" },
};

export default function FactCheckPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["factcheck-page"],
    queryFn: async () => (await api.get("/analyses?status=READY&limit=50")).data,
  });

  if (isLoading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  const items = data?.items?.filter((a: any) => a.status === "READY") ?? [];
  const allClaims = items.flatMap((a: any) =>
    (a.claims ?? []).map((c: any) => ({ ...c, docTitle: a.research?.title ?? "Document" }))
  );

  if (!allClaims.length) return (
    <div>
      <PageHeader title="Fact Check" description="Claim extraction, cross-reference verification, and evidence scoring." />
      <Empty icon={<ShieldCheck className="h-7 w-7 text-muted" />} title="No claims extracted" description="Upload documents to extract and verify claims." />
    </div>
  );

  const counts = { TRUE: 0, FALSE: 0, MISLEADING: 0, UNVERIFIED: 0 };
  allClaims.forEach((c: any) => {
    const v = (c.verdict ?? "UNVERIFIED") as keyof typeof counts;
    if (v in counts) counts[v]++;
  });

  const pieData = Object.entries(counts).map(([name, value]) => ({
    name, value,
    fill: name === "TRUE" ? "#10b981" : name === "FALSE" ? "#ef4444" : name === "MISLEADING" ? "#f59e0b" : "#6b7280",
  })).filter(d => d.value > 0);

  const verdictGroups = Object.keys(VERDICT_CONFIG).map(v => ({
    verdict: v,
    claims: allClaims.filter((c: any) => (c.verdict ?? "UNVERIFIED") === v),
    ...VERDICT_CONFIG[v],
  })).filter(g => g.claims.length > 0);

  return (
    <div>
      <PageHeader title="Fact Check" description="Claim extraction, cross-reference verification, and evidence scoring."
        badge={<Badge variant="brand">{allClaims.length} claims</Badge>} />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {Object.entries(counts).map(([verdict, count], i) => {
          const cfg = VERDICT_CONFIG[verdict];
          const Icon = cfg.icon;
          return (
            <motion.div key={verdict} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card>
                <CardBody className="flex items-center gap-3">
                  <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0", cfg.bg)}>
                    <Icon className={cn("h-5 w-5", cfg.color)} />
                  </div>
                  <div>
                    <p className="text-xs text-muted">{cfg.label}</p>
                    <p className="text-2xl font-bold font-display">{count}</p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-5">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="h-full">
            <CardBody>
              <CardTitle className="mb-3">Verdict Distribution</CardTitle>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} paddingAngle={3} dataKey="value"
                    label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                    {pieData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>

        <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <CardBody>
              <CardTitle className="mb-3">Verification Summary</CardTitle>
              <div className="space-y-4">
                {verdictGroups.map((g) => {
                  const pct = Math.round((g.claims.length / allClaims.length) * 100);
                  const barColor = g.verdict === "TRUE" ? "bg-success" : g.verdict === "FALSE" ? "bg-danger" : g.verdict === "MISLEADING" ? "bg-warning" : "bg-muted";
                  const Icon = g.icon;
                  return (
                    <div key={g.verdict} className="flex items-center gap-3">
                      <Icon className={cn("h-4 w-4 shrink-0", g.color)} />
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium">{g.label}</span>
                          <span className="text-muted">{g.claims.length} claims ({pct}%)</span>
                        </div>
                        <div className="h-2 bg-elevated rounded-full overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all", barColor)} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Claims by verdict group */}
      {verdictGroups.map((g, gi) => (
        <motion.div key={g.verdict} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 + gi * 0.08 }} className="mb-4">
          <Card>
            <div className="px-5 py-3.5 border-b border-border flex items-center gap-2">
              <g.icon className={cn("h-4 w-4", g.color)} />
              <CardTitle>{g.label} ({g.claims.length})</CardTitle>
            </div>
            <div className="divide-y divide-border max-h-64 overflow-y-auto scrollbar-thin">
              {g.claims.slice(0, 10).map((c: any, i: number) => (
                <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.03 }}
                  className="px-5 py-3 flex items-start gap-3">
                  <g.icon className={cn("h-4 w-4 shrink-0 mt-0.5", g.color)} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm leading-relaxed">{c.text}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted">Source: {c.docTitle}</span>
                      {c.confidence != null && (
                        <span className="text-xs text-muted">· Confidence: {Math.round(c.confidence * 100)}%</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

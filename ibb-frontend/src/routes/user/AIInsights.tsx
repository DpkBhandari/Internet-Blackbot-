import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { Badge } from "@/components/ui/Badge";
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, Brain, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface InsightCard { type: "pattern" | "risk" | "opportunity" | "anomaly"; title: string; body: string; severity: "low" | "medium" | "high"; }

function deriveInsights(items: any[]): InsightCard[] {
  if (!items.length) return [];
  const insights: InsightCard[] = [];

  const avgCred = items.reduce((s, a) => s + (a.credibilityScore ?? 0.5), 0) / items.length;
  const avgMisinfo = items.reduce((s, a) => s + (a.misinformationScore ?? 0), 0) / items.length;
  const negCount = items.filter(a => a.sentiment?.label === "negative").length;
  const posCount = items.filter(a => a.sentiment?.label === "positive").length;

  // Credibility insight
  if (avgCred >= 0.75) {
    insights.push({ type: "opportunity", title: "High-Credibility Corpus", body: `Your research corpus scores ${Math.round(avgCred * 100)}% average credibility — well above the 70% threshold. This is a strong foundation for publishable research.`, severity: "low" });
  } else if (avgCred < 0.4) {
    insights.push({ type: "risk", title: "Low Corpus Credibility", body: `Average credibility is ${Math.round(avgCred * 100)}%. Consider sourcing higher-authority references or removing low-trust documents.`, severity: "high" });
  }

  // Misinfo insight
  if (avgMisinfo > 0.5) {
    insights.push({ type: "risk", title: "Elevated Misinformation Risk", body: `${Math.round(avgMisinfo * 100)}% average misinformation risk detected. Manual review of flagged claims is strongly recommended before publishing.`, severity: "high" });
  }

  // Sentiment pattern
  if (negCount > items.length * 0.6) {
    insights.push({ type: "pattern", title: "Predominantly Negative Corpus", body: `${negCount} of ${items.length} documents carry negative sentiment. This may indicate a bias toward adversarial or critical content. Consider balancing sources.`, severity: "medium" });
  } else if (posCount > items.length * 0.7) {
    insights.push({ type: "anomaly", title: "Unusually Positive Corpus variant", body: `${posCount} of ${items.length} documents are positive-sentiment. Verify sources are not promotional or biased toward favorable framing.`, severity: "medium" });
  }

  // Keyword density
  const allKw: Record<string, number> = {};
  items.forEach(a => (a.keywords ?? []).forEach((k: string) => { allKw[k] = (allKw[k] ?? 0) + 1; }));
  const topKw = Object.entries(allKw).sort((a, b) => b[1] - a[1]).slice(0, 3);
  if (topKw.length > 0) {
    insights.push({ type: "pattern", title: "Dominant Research Themes", body: `Recurring themes detected: "${topKw.map(([k]) => k).join('", "')}". These concepts appear across ${topKw[0]?.[1]} or more documents — likely core to your research focus.`, severity: "low" });
  }

  // Claims insight
  const totalClaims = items.reduce((s, a) => s + (a.claims?.length ?? 0), 0);
  if (totalClaims > 20) {
    insights.push({ type: "opportunity", title: "Rich Claim Density", body: `${totalClaims} verifiable claims extracted across your corpus. Running automated fact-checking could significantly strengthen your research quality.`, severity: "low" });
  }

  if (items.length >= 5) {
    insights.push({ type: "opportunity", title: "Sufficient Corpus for Comparison", body: `With ${items.length} analyzed documents, semantic comparison and cross-document analysis are now highly reliable. Check the Semantic Match page for document clusters.`, severity: "low" });
  }

  return insights.slice(0, 8);
}

const typeConfig = {
  pattern:     { icon: Brain,         color: "text-brand",   bg: "bg-brand/10",   label: "Pattern",     border: "border-brand/20"   },
  risk:        { icon: AlertTriangle, color: "text-danger",  bg: "bg-danger/10",  label: "Risk",        border: "border-danger/20"  },
  opportunity: { icon: Lightbulb,     color: "text-success", bg: "bg-success/10", label: "Opportunity", border: "border-success/20" },
  anomaly:     { icon: Target,        color: "text-warning", bg: "bg-warning/10", label: "Anomaly",     border: "border-warning/20" },
};
const sevVariant = { low: "success", medium: "warning", high: "danger" } as const;

export default function AIInsights() {
  const { data, isLoading } = useQuery({
    queryKey: ["ai-insights"],
    queryFn: async () => (await api.get("/analyses?status=READY&limit=50")).data,
  });

  if (isLoading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  const items = data?.items?.filter((a: any) => a.status === "READY") ?? [];
  const insights = deriveInsights(items);

  if (!items.length) return (
    <div>
      <PageHeader title="AI Insights" description="Strategic patterns, risk indicators, and hidden correlations in your research." />
      <Empty icon={<Sparkles className="h-7 w-7 text-muted" />} title="No insights yet" description="Upload and analyze documents to unlock AI-generated insights." />
    </div>
  );

  const avgCred = items.reduce((s: number, a: any) => s + (a.credibilityScore ?? 0.5), 0) / items.length;
  const riskCount = insights.filter(i => i.type === "risk").length;
  const oppCount = insights.filter(i => i.type === "opportunity").length;

  return (
    <div>
      <PageHeader title="AI Insights" description="Strategic patterns, risk indicators, anomaly detection, and recommendations."
        badge={<Badge variant="brand">{insights.length} insights</Badge>} />

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Corpus Analyzed", val: `${items.length} docs`, icon: Brain, color: "text-brand", bg: "bg-brand/10" },
          { label: "Risks Detected", val: riskCount, icon: AlertTriangle, color: "text-danger", bg: "bg-danger/10" },
          { label: "Opportunities", val: oppCount, icon: Lightbulb, color: "text-success", bg: "bg-success/10" },
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

      {/* Insight cards */}
      <div className="grid md:grid-cols-2 gap-4">
        {insights.map((ins, i) => {
          const cfg = typeConfig[ins.type];
          const Icon = cfg.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}>
              <Card className={cn("border h-full", cfg.border)}>
                <CardBody>
                  <div className="flex items-start gap-3">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", cfg.bg)}>
                      <Icon className={cn("h-5 w-5", cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="font-semibold text-sm">{ins.title}</p>
                        <Badge variant={cfg.label.toLowerCase() as any} className="text-[10px] shrink-0">{cfg.label}</Badge>
                        <Badge variant={sevVariant[ins.severity]} className="text-[10px] shrink-0 ml-auto">
                          {ins.severity} severity
                        </Badge>
                      </div>
                      <p className="text-sm text-muted leading-relaxed">{ins.body}</p>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { ErrorState } from "@/components/ui/ErrorState";
import { ExternalLink, ShieldCheck, Smile, Frown, Meh, AlertTriangle, FileText, Tag } from "lucide-react";
import { pct, scoreColor, cn } from "@/lib/utils";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from "recharts";

export default function AnalysisView() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["analysis", id],
    queryFn: async () => (await api.get(`/analyses/${id}`)).data,
  });

  if (isLoading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  if (error) return <ErrorState onRetry={() => refetch()} />;

  const a = data;
  const sentIcon = a.sentiment?.label === "positive" ? Smile : a.sentiment?.label === "negative" ? Frown : Meh;
  const SentIcon = sentIcon;
  const radarData = [
    { metric: "Credibility", value: Math.round((a.credibilityScore || 0) * 100) },
    { metric: "Sentiment",   value: Math.round((a.sentiment?.score || 0.5) * 100) },
    { metric: "Safety",      value: Math.round((1 - (a.misinformationScore || 0)) * 100) },
    { metric: "Keywords",    value: Math.min(100, (a.metrics?.keywordCount || 0) * 5) },
    { metric: "Claims",      value: Math.min(100, (a.metrics?.claimCount || 0) * 10) },
  ];

  return (
    <div>
      <PageHeader
        title={a.research?.title || a.research?.fileName || "Analysis"}
        description={a.research?.topic || a.summary?.slice(0, 100)}
        badge={<Badge variant={a.status === "READY" ? "success" : "warning"} dot>{a.status}</Badge>}
      />

      <div className="grid lg:grid-cols-3 gap-4 mb-4">
        {/* Credibility */}
        {[
          { label: "Credibility Score", value: pct(a.credibilityScore || 0), color: scoreColor(a.credibilityScore || 0), icon: ShieldCheck },
          { label: "Sentiment", value: a.sentiment?.label || "neutral", color: a.sentiment?.label === "positive" ? "text-success" : a.sentiment?.label === "negative" ? "text-danger" : "text-muted", icon: SentIcon },
          { label: "Misinfo Risk", value: pct(a.misinformationScore || 0), color: scoreColor(1 - (a.misinformationScore || 0)), icon: AlertTriangle },
        ].map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card>
              <CardBody className="flex items-center gap-4">
                <div className="h-12 w-12 rounded-xl bg-elevated flex items-center justify-center shrink-0">
                  <m.icon className={cn("h-5 w-5", m.color)} />
                </div>
                <div>
                  <p className="text-xs text-muted">{m.label}</p>
                  <p className={cn("text-2xl font-bold font-display capitalize", m.color)}>{m.value}</p>
                </div>
              </CardBody>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mb-4">
        {/* Summary */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Card>
            <CardBody>
              <CardTitle className="flex items-center gap-2 mb-3"><FileText className="h-4 w-4 text-brand" /> Summary</CardTitle>
              <p className="text-sm text-muted leading-relaxed">{a.summary || "Summary not available."}</p>
              {a.metrics && (
                <div className="flex gap-4 mt-4 pt-4 border-t border-border flex-wrap">
                  {[["Words", a.metrics.wordCount], ["Sentences", a.metrics.sentenceCount], ["Keywords", a.metrics.keywordCount], ["Claims", a.metrics.claimCount]].map(([k, v]) => (
                    <div key={k as string}><p className="text-xs text-muted">{k}</p><p className="font-semibold">{v}</p></div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>

        {/* Radar chart */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardBody>
              <CardTitle className="mb-3">Analysis Overview</CardTitle>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgb(var(--border))" />
                  <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11, fill: "rgb(var(--muted))" }} />
                  <Radar dataKey="value" stroke="rgb(var(--brand))" fill="rgb(var(--brand))" fillOpacity={0.2} strokeWidth={2} />
                  <Tooltip contentStyle={{ background: "rgb(var(--elevated))", border: "1px solid rgb(var(--border))", borderRadius: 8, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </CardBody>
          </Card>
        </motion.div>
      </div>

      {/* Keywords */}
      {a.keywords?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="mb-4">
          <Card>
            <CardBody>
              <CardTitle className="flex items-center gap-2 mb-3"><Tag className="h-4 w-4 text-accent" /> Keywords</CardTitle>
              <div className="flex flex-wrap gap-2">
                {a.keywords.map((k: string, i: number) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-elevated border border-border text-xs text-muted hover:border-brand/40 transition-colors">{k}</span>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Sources */}
      {a.sources?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card>
            <CardBody>
              <CardTitle className="mb-3">Sources ({a.sources.length})</CardTitle>
              <div className="space-y-3">
                {a.sources.map((s: any) => (
                  <div key={s._id} className="flex items-start gap-3 p-3 rounded-lg bg-elevated">
                    <div className="flex-1 min-w-0">
                      <a href={s.url} target="_blank" rel="noreferrer" className="text-sm font-medium text-brand hover:underline flex items-center gap-1 line-clamp-1">
                        {s.title || s.url} <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                      {s.snippet && <p className="text-xs text-muted mt-0.5 line-clamp-2">{s.snippet}</p>}
                    </div>
                    <div className={cn("text-xs font-mono font-bold shrink-0", scoreColor(s.credibilityScore || 0))}>
                      {pct(s.credibilityScore || 0)}
                    </div>
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        </motion.div>
      )}
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Library, Search, ChevronDown, ChevronUp, ExternalLink, Tag, FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

export default function ResearchPage() {
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["research-explorer"],
    queryFn: async () => (await api.get("/analyses?status=READY&limit=50")).data,
  });

  if (isLoading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  const items = data?.items?.filter((a: any) => a.status === "READY") ?? [];

  const filtered = q.trim()
    ? items.filter((a: any) => {
        const text = `${a.research?.title ?? ""} ${a.research?.topic ?? ""} ${(a.keywords ?? []).join(" ")} ${a.summary ?? ""}`.toLowerCase();
        return text.includes(q.toLowerCase());
      })
    : items;

  if (!items.length) return (
    <div>
      <PageHeader title="Research Explorer" description="Semantic search, topic clustering, and entity extraction." />
      <Empty icon={<Library className="h-7 w-7 text-muted" />} title="No research documents" description="Upload and analyze documents to explore your research corpus." />
    </div>
  );

  // Topic clusters from keywords
  const allKw: Record<string, number> = {};
  items.forEach((a: any) => (a.keywords ?? []).forEach((k: string) => { allKw[k] = (allKw[k] ?? 0) + 1; }));
  const topTopics = Object.entries(allKw).sort((a, b) => b[1] - a[1]).slice(0, 12);

  return (
    <div>
      <PageHeader title="Research Explorer" description="Semantic search, topic clustering, entity extraction, and document relationships."
        badge={<Badge variant="brand">{items.length} documents</Badge>} />

      {/* Topic cluster pills */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card>
          <CardBody>
            <CardTitle className="mb-3 flex items-center gap-2"><Tag className="h-4 w-4 text-accent" /> Topic Clusters</CardTitle>
            <div className="flex flex-wrap gap-2">
              {topTopics.map(([kw, count]) => (
                <button key={kw} onClick={() => setQ(q === kw ? "" : kw)}
                  className={cn("px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
                    q === kw ? "border-brand bg-brand/15 text-brand" : "border-border text-muted hover:border-brand/40 hover:text-text")}>
                  {kw} <span className="text-xs opacity-60">×{count}</span>
                </button>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Search */}
      <div className="mb-5">
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search across titles, topics, keywords, summaries…"
          icon={<Search className="h-4 w-4" />} />
        {q && <p className="text-xs text-muted mt-2">{filtered.length} result{filtered.length !== 1 ? "s" : ""} for "{q}"</p>}
      </div>

      {/* Document cards */}
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <Empty title={`No results for "${q}"`} description="Try a different keyword or topic." />
        ) : (
          <div className="space-y-3">
            {filtered.map((a: any, i: number) => {
              const isOpen = expanded === a._id;
              const cred = a.credibilityScore ?? 0.5;
              const credColor = cred >= 0.7 ? "success" : cred >= 0.4 ? "warning" : "danger";
              return (
                <motion.div key={a._id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }} transition={{ delay: i * 0.03 }}>
                  <Card className={cn("transition-all duration-200", isOpen && "border-brand/30")}>
                    <CardBody>
                      <div className="flex items-start gap-4 cursor-pointer" onClick={() => setExpanded(isOpen ? null : a._id)}>
                        <div className="h-10 w-10 rounded-xl bg-brand/10 flex items-center justify-center shrink-0">
                          <FileText className="h-4 w-4 text-brand" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{a.research?.title ?? a.research?.fileName ?? "Document"}</p>
                            <Badge variant={credColor as any}>{Math.round(cred * 100)}% credible</Badge>
                            {a.sentiment?.label && (
                              <Badge variant={a.sentiment.label === "positive" ? "success" : a.sentiment.label === "negative" ? "danger" : "default"}>
                                {a.sentiment.label}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted mt-1 line-clamp-2">{a.summary ?? "No summary available."}</p>
                          {(a.keywords ?? []).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {(a.keywords as string[]).slice(0, 6).map((k: string) => (
                                <span key={k} className="px-2 py-0.5 rounded-full bg-elevated text-[10px] text-muted border border-border">{k}</span>
                              ))}
                              {(a.keywords ?? []).length > 6 && (
                                <span className="px-2 py-0.5 rounded-full bg-elevated text-[10px] text-muted border border-border">
                                  +{(a.keywords ?? []).length - 6} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="shrink-0 text-muted">
                          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </div>
                      </div>

                      <AnimatePresence>
                        {isOpen && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }} className="mt-4 pt-4 border-t border-border overflow-hidden">
                            <div className="grid lg:grid-cols-2 gap-4">
                              <div>
                                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Analysis Scores</p>
                                <div className="space-y-2">
                                  {[
                                    { label: "Credibility", val: Math.round((a.credibilityScore ?? 0.5) * 100), color: "bg-success" },
                                    { label: "Misinfo Risk", val: Math.round((a.misinformationScore ?? 0) * 100), color: "bg-danger" },
                                    { label: "Sentiment Confidence", val: Math.round((a.sentiment?.score ?? 0.5) * 100), color: "bg-brand" },
                                  ].map(m => (
                                    <div key={m.label} className="flex items-center gap-3 text-xs">
                                      <span className="text-muted w-36">{m.label}</span>
                                      <div className="flex-1 h-1.5 bg-elevated rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full", m.color)} style={{ width: `${m.val}%` }} />
                                      </div>
                                      <span className="font-mono w-8 text-right">{m.val}%</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2">Claims ({(a.claims ?? []).length})</p>
                                <div className="space-y-1 max-h-28 overflow-y-auto scrollbar-thin">
                                  {(a.claims ?? []).slice(0, 4).map((c: any, ci: number) => (
                                    <p key={ci} className="text-xs text-muted line-clamp-2 border-l-2 border-border pl-2">{c.text}</p>
                                  ))}
                                  {!(a.claims ?? []).length && <p className="text-xs text-muted">No claims extracted.</p>}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                              <Button variant="outline" size="xs" onClick={() => window.open(`/app/analysis/${a._id}`, "_blank")}
                                icon={<ExternalLink className="h-3.5 w-3.5" />}>
                                Full Analysis
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

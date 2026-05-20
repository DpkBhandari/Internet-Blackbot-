import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { Badge } from "@/components/ui/Badge";
import { Network, GitCompare, Layers, ArrowLeftRight } from "lucide-react";
import { cn, pct } from "@/lib/utils";

function SimilarityCell({ score }: { score: number }) {
  const pctVal = Math.round(score * 100);
  const bg = score >= 0.7 ? "bg-success/20 text-success" : score >= 0.4 ? "bg-warning/20 text-warning" : score > 0 ? "bg-danger/15 text-danger" : "bg-elevated text-muted";
  return (
    <div className={cn("h-12 flex items-center justify-center text-xs font-bold font-mono rounded transition-all", bg)}>
      {score > 0 ? `${pctVal}%` : "—"}
    </div>
  );
}

export default function SemanticPage() {
  const [selected, setSelected] = useState<[number, number] | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["semantic-page"],
    queryFn: async () => (await api.get("/analyses?status=READY&limit=20")).data,
  });

  if (isLoading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  const items = data?.items?.filter((a: any) => a.status === "READY") ?? [];

  if (items.length < 2) return (
    <div>
      <PageHeader title="Semantic Match" description="Compare documents for semantic similarity, concept overlap, and contradictions." />
      <Empty icon={<Network className="h-7 w-7 text-muted" />} title="Need at least 2 documents"
        description="Upload and analyze 2 or more documents to run semantic comparison." />
    </div>
  );

  // Build similarity matrix from keyword overlap (real semantic would need backend call)
  const buildSimilarity = (a: any, b: any): number => {
    if (a._id === b._id) return 1;
    const kwA = new Set<string>((a.keywords ?? []).map((k: string) => k.toLowerCase()));
    const kwB = new Set<string>((b.keywords ?? []).map((k: string) => k.toLowerCase()));
    const intersection = [...kwA].filter(k => kwB.has(k)).length;
    const union = new Set([...kwA, ...kwB]).size;
    const jac = union > 0 ? intersection / union : 0;
    // Sentiment similarity bonus
    const sentA = a.sentiment?.label ?? "neutral";
    const sentB = b.sentiment?.label ?? "neutral";
    const sentBonus = sentA === sentB ? 0.1 : 0;
    return Math.min(1, jac + sentBonus);
  };

  const matrix = items.map((a: any) => items.map((b: any) => buildSimilarity(a, b)));

  const avgSimilarity = (() => {
    let sum = 0, count = 0;
    matrix.forEach((row: number[], i: number) => row.forEach((val: number, j: number) => {
      if (i !== j) { sum += val; count++; }
    }));
    return count > 0 ? sum / count : 0;
  })();

  const topPairs: { i: number; j: number; score: number }[] = [];
  matrix.forEach((row: number[], i: number) => row.forEach((val: number, j: number) => {
    if (j > i) topPairs.push({ i, j, score: val });
  }));
  topPairs.sort((a, b) => b.score - a.score);

  const selA = selected ? items[selected[0]] : null;
  const selB = selected ? items[selected[1]] : null;
  const selScore = selected ? matrix[selected[0]][selected[1]] : null;

  const sharedKw = selA && selB
    ? (selA.keywords ?? []).filter((k: string) => (selB.keywords ?? []).includes(k))
    : [];

  return (
    <div>
      <PageHeader title="Semantic Match" description="Document similarity matrix, concept overlap, and comparative analysis."
        badge={<Badge variant="brand">{items.length} documents</Badge>} />

      <div className="grid grid-cols-3 gap-4 mb-5">
        {[
          { label: "Documents Compared", val: items.length, icon: Layers, color: "text-brand", bg: "bg-brand/10" },
          { label: "Avg Similarity", val: `${Math.round(avgSimilarity * 100)}%`, icon: Network, color: "text-accent", bg: "bg-accent/10" },
          { label: "Top Pair Score", val: topPairs[0] ? `${Math.round(topPairs[0].score * 100)}%` : "—", icon: GitCompare, color: "text-success", bg: "bg-success/10" },
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

      {/* Heatmap matrix */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mb-5">
        <Card>
          <CardBody>
            <CardTitle className="mb-4">Similarity Heatmap — click a cell to compare</CardTitle>
            <div className="overflow-x-auto">
              <table className="w-full" style={{ tableLayout: "fixed" }}>
                <thead>
                  <tr>
                    <th className="w-32 p-1" />
                    {items.map((a: any, i: number) => (
                      <th key={i} className="p-1">
                        <div className="text-[10px] text-muted font-normal truncate px-1 text-center">
                          {(a.research?.title ?? `Doc ${i + 1}`).slice(0, 14)}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((a: any, i: number) => (
                    <tr key={i}>
                      <td className="p-1 pr-2">
                        <div className="text-[10px] text-muted truncate text-right">
                          {(a.research?.title ?? `Doc ${i + 1}`).slice(0, 14)}
                        </div>
                      </td>
                      {items.map((_b: any, j: number) => (
                        <td key={j} className="p-1">
                          <div
                            onClick={() => i !== j && setSelected([i, j])}
                            className={cn(i !== j && "cursor-pointer hover:ring-2 hover:ring-brand/50 rounded",
                              selected && selected[0] === i && selected[1] === j && "ring-2 ring-brand rounded")}>
                            <SimilarityCell score={matrix[i][j]} />
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs text-muted flex-wrap">
              {[["bg-success/20 text-success", "High (70%+)"], ["bg-warning/20 text-warning", "Medium (40-70%)"], ["bg-danger/15 text-danger", "Low (<40%)"]].map(([cls, lbl]) => (
                <span key={lbl} className="flex items-center gap-1.5">
                  <span className={cn("h-3 w-3 rounded", cls.split(" ")[0])} /> {lbl}
                </span>
              ))}
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Comparison panel */}
      {selA && selB && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
          <Card className="border-brand/30">
            <CardBody>
              <div className="flex items-center gap-3 mb-4">
                <ArrowLeftRight className="h-5 w-5 text-brand" />
                <CardTitle>Document Comparison</CardTitle>
                <Badge variant="brand" className="ml-auto">Similarity: {Math.round((selScore ?? 0) * 100)}%</Badge>
              </div>
              <div className="grid lg:grid-cols-2 gap-5">
                {[selA, selB].map((doc: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-elevated">
                    <p className="font-semibold text-sm mb-2">{doc.research?.title ?? "Document"}</p>
                    <p className="text-xs text-muted mb-3 line-clamp-3">{doc.summary ?? "No summary."}</p>
                    <div className="flex flex-wrap gap-1">
                      {(doc.keywords ?? []).slice(0, 10).map((k: string) => (
                        <span key={k} className={cn("px-2 py-0.5 rounded-full text-[10px] font-medium",
                          sharedKw.includes(k) ? "bg-brand/20 text-brand border border-brand/30" : "bg-surface text-muted border border-border")}>
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              {sharedKw.length > 0 && (
                <div className="mt-4 p-3 rounded-lg bg-brand/5 border border-brand/20">
                  <p className="text-xs font-semibold text-brand mb-2">Shared concepts ({sharedKw.length})</p>
                  <div className="flex flex-wrap gap-1">
                    {sharedKw.map((k: string) => (
                      <span key={k} className="px-2 py-0.5 rounded-full text-[10px] bg-brand/20 text-brand font-medium">{k}</span>
                    ))}
                  </div>
                </div>
              )}
            </CardBody>
          </Card>
        </motion.div>
      )}

      {/* Top similar pairs */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card>
          <div className="px-5 py-3.5 border-b border-border"><CardTitle>Most Similar Pairs</CardTitle></div>
          <div className="divide-y divide-border">
            {topPairs.slice(0, 8).map((pair, i) => {
              const docA = items[pair.i];
              const docB = items[pair.j];
              const scoreColor = pair.score >= 0.7 ? "text-success" : pair.score >= 0.4 ? "text-warning" : "text-danger";
              return (
                <motion.div key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.04 }}
                  className="px-5 py-3.5 flex items-center gap-4 hover:bg-elevated/40 cursor-pointer transition-colors"
                  onClick={() => setSelected([pair.i, pair.j])}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium truncate max-w-[180px]">{docA.research?.title ?? `Doc ${pair.i + 1}`}</span>
                      <ArrowLeftRight className="h-3.5 w-3.5 text-muted shrink-0" />
                      <span className="font-medium truncate max-w-[180px]">{docB.research?.title ?? `Doc ${pair.j + 1}`}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="h-1.5 w-20 bg-elevated rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", pair.score >= 0.7 ? "bg-success" : pair.score >= 0.4 ? "bg-warning" : "bg-danger")}
                        style={{ width: `${Math.round(pair.score * 100)}%` }} />
                    </div>
                    <span className={cn("text-sm font-bold font-mono w-10 text-right", scoreColor)}>
                      {Math.round(pair.score * 100)}%
                    </span>
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

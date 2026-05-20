import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Quote, Copy, Download, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

type CiteFmt = "APA" | "MLA" | "Chicago" | "Harvard";

function formatCitation(source: any, analysis: any, fmt: CiteFmt): string {
  const today = new Date();
  const year = source.publishedAt ? new Date(source.publishedAt).getFullYear() : today.getFullYear();
  const accessed = today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const title = source.title || "Untitled Source";
  const url = source.url || "";
  const domain = source.domain || "Unknown Publisher";
  const docTitle = analysis?.research?.title || "Research Document";

  switch (fmt) {
    case "APA":
      return `${domain}. (${year}). *${title}*. Retrieved ${accessed}, from ${url || "N/A"}`;
    case "MLA":
      return `"${title}." *${domain}*, ${year}, ${url || "N/A"}. Accessed ${accessed}.`;
    case "Chicago":
      return `${domain}. "${title}." Accessed ${accessed}. ${url || "N/A"}.`;
    case "Harvard":
      return `${domain} (${year}) '${title}', available at: ${url || "N/A"} [Accessed ${accessed}].`;
  }
}

function formatDocCitation(analysis: any, fmt: CiteFmt): string {
  const today = new Date();
  const year = new Date(analysis.createdAt || today).getFullYear();
  const accessed = today.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const title = analysis.research?.title || analysis.research?.fileName || "Research Document";

  switch (fmt) {
    case "APA":
      return `Internet Black Box. (${year}). *${title}* [AI Analysis Report]. Retrieved ${accessed}.`;
    case "MLA":
      return `"${title}." *Internet Black Box Analysis*, ${year}. Accessed ${accessed}.`;
    case "Chicago":
      return `Internet Black Box. "${title}." Analyzed ${year}. Accessed ${accessed}.`;
    case "Harvard":
      return `Internet Black Box (${year}) '${title}' [AI Analysis]. Accessed ${accessed}.`;
  }
}

export default function CitationsPage() {
  const [fmt, setFmt] = useState<CiteFmt>("APA");
  const [copied, setCopied] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["citations-page"],
    queryFn: async () => (await api.get("/analyses?status=READY&limit=50")).data,
  });

  if (isLoading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  const items = data?.items?.filter((a: any) => a.status === "READY") ?? [];

  if (!items.length) return (
    <div>
      <PageHeader title="Citations" description="Auto-generate APA, MLA, Chicago, and Harvard citations." />
      <Empty icon={<Quote className="h-7 w-7 text-muted" />} title="No documents" description="Upload and analyze documents to generate citations." />
    </div>
  );

  const allSources = items.flatMap((a: any) => (a.sources ?? []).map((s: any) => ({ source: s, analysis: a })));

  const copyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Citation copied!");
    setTimeout(() => setCopied(null), 2000);
  };

  const exportAll = () => {
    const lines: string[] = [`${fmt} Bibliography — Internet Black Box\n${"=".repeat(50)}\n`];
    items.forEach((a: any, i: number) => {
      lines.push(`[${i + 1}] ${formatDocCitation(a, fmt)}`);
      (a.sources ?? []).forEach((s: any, j: number) => {
        lines.push(`    [${i + 1}.${j + 1}] ${formatCitation(s, a, fmt)}`);
      });
    });
    const blob = new Blob([lines.join("\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `bibliography-${fmt.toLowerCase()}.txt`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Bibliography exported!");
  };

  const totalCitations = items.length + allSources.length;

  return (
    <div>
      <PageHeader title="Citations" description="Auto-generate formatted citations for all analyzed documents and sources."
        badge={<Badge variant="brand">{totalCitations} citations</Badge>}
        actions={
          <Button variant="outline" size="sm" onClick={exportAll} icon={<Download className="h-4 w-4" />}>
            Export All
          </Button>
        }
      />

      {/* Format selector */}
      <div className="flex gap-2 mb-5">
        {(["APA", "MLA", "Chicago", "Harvard"] as CiteFmt[]).map(f => (
          <button key={f} onClick={() => setFmt(f)}
            className={cn("px-4 py-2 rounded-lg text-sm font-medium border transition-all",
              fmt === f ? "border-brand bg-brand/10 text-brand" : "border-border text-muted hover:border-brand/40 hover:text-text")}>
            {f}
          </button>
        ))}
      </div>

      {/* Document citations */}
      <div className="mb-5">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Document Citations</h2>
        <div className="space-y-3">
          {items.map((a: any, i: number) => {
            const cite = formatDocCitation(a, fmt);
            const id = `doc-${a._id}-${fmt}`;
            return (
              <motion.div key={a._id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card>
                  <CardBody className="flex items-start gap-4">
                    <div className="h-9 w-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 text-xs font-bold text-brand">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted mb-1 font-medium">{a.research?.title || "Document"}</p>
                      <p className="text-sm font-mono leading-relaxed text-text/80 italic">{cite}</p>
                    </div>
                    <button onClick={() => copyText(cite, id)}
                      className={cn("p-2 rounded-lg transition-all shrink-0",
                        copied === id ? "bg-success/15 text-success" : "hover:bg-elevated text-muted hover:text-text")}>
                      <Copy className="h-4 w-4" />
                    </button>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Source citations */}
      {allSources.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold text-muted uppercase tracking-wider mb-3">Source Citations ({allSources.length})</h2>
          <div className="space-y-3">
            {allSources.slice(0, 20).map(({ source, analysis }: any, i: number) => {
              const cite = formatCitation(source, analysis, fmt);
              const id = `src-${i}-${fmt}`;
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.03 }}>
                  <Card>
                    <CardBody className="flex items-start gap-4">
                      <div className="h-9 w-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
                        <BookOpen className="h-4 w-4 text-accent" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-xs text-muted">{source.domain || "Web"}</p>
                          {source.sourceType && <Badge variant="default" className="text-[10px]">{source.sourceType}</Badge>}
                        </div>
                        <p className="text-sm font-mono leading-relaxed text-text/80 italic">{cite}</p>
                      </div>
                      <button onClick={() => copyText(cite, id)}
                        className={cn("p-2 rounded-lg transition-all shrink-0",
                          copied === id ? "bg-success/15 text-success" : "hover:bg-elevated text-muted hover:text-text")}>
                        <Copy className="h-4 w-4" />
                      </button>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

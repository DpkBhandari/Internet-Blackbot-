import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Empty } from "@/components/ui/Empty";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Search, ExternalLink, FileText, Globe } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { useNavigate } from "react-router-dom";

export default function SearchResults() {
  const [params] = useSearchParams();
  const nav = useNavigate();
  const [q, setQ] = useState(params.get("q") || "");
  const debouncedQ = useDebounce(q, 400);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["search", debouncedQ],
    queryFn: async () => (await api.get(`/search?q=${encodeURIComponent(debouncedQ)}&limit=40`)).data,
    enabled: debouncedQ.length >= 2,
  });

  useEffect(() => {
    if (debouncedQ) nav(`/app/search?q=${encodeURIComponent(debouncedQ)}`, { replace: true });
  }, [debouncedQ]);

  return (
    <div>
      <PageHeader title="Search" description="Search across your research documents and sources." />

      <div className="mb-6 max-w-xl">
        <Input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Search anything…"
          icon={<Search className="h-4 w-4" />}
          autoFocus
        />
      </div>

      {q.length < 2 ? (
        <Empty icon={<Search className="h-7 w-7 text-muted" />} title="Start typing to search" description="Search your research documents, titles, topics, and sources." />
      ) : isLoading || isFetching ? (
        <SkeletonTable />
      ) : !data?.results?.length ? (
        <Empty title={`No results for "${q}"`} description="Try a different search term." />
      ) : (
        <Card>
          <div className="px-5 py-3.5 border-b border-border text-sm text-muted">
            {data.total} result{data.total !== 1 ? "s" : ""} for <strong className="text-text">"{q}"</strong>
          </div>
          <AnimatePresence initial={false}>
            {data.results.map((r: any, i: number) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="px-5 py-4 border-b border-border last:border-0 hover:bg-elevated/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5", r.type === "source" ? "bg-success/10 text-success" : "bg-brand/10 text-brand")}>
                    {r.type === "source" ? <Globe className="h-4 w-4" /> : <FileText className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <p className="font-medium text-sm line-clamp-1">{r.title}</p>
                      <Badge variant={r.type === "source" ? "success" : "brand"} className="text-[10px]">{r.type}</Badge>
                    </div>
                    {r.snippet && <p className="text-sm text-muted line-clamp-2">{r.snippet}</p>}
                    <div className="flex items-center gap-3 mt-1">
                      {r.url && (
                        <a href={r.url} target="_blank" rel="noreferrer" className="text-xs text-brand hover:underline flex items-center gap-1">
                          <ExternalLink className="h-3 w-3" />{r.url.slice(0, 60)}…
                        </a>
                      )}
                      <span className="text-xs text-muted">{formatDate(r.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </Card>
      )}
    </div>
  );
}

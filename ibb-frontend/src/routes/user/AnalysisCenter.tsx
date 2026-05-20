import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { BarChart3, Eye, ArrowRight } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AnalysisCenter() {
  const { data, isLoading } = useQuery({
    queryKey: ["analyses"],
    queryFn: async () => (await api.get("/analyses")).data,
  });
  return (
    <div>
      <PageHeader title="Content Analysis" description="View all AI-generated analyses from your uploaded documents." />
      {isLoading ? <SkeletonTable /> : !data?.items?.length ? (
        <Empty icon={<BarChart3 className="h-7 w-7 text-muted" />} title="No analyses yet" description="Upload a document to get started." action={<Link to="/app/upload"><Button size="sm">Upload document</Button></Link>} />
      ) : (
        <Card>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted border-b border-border">
              <th className="px-5 py-3 font-medium">Document</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Sentiment</th>
              <th className="px-5 py-3 font-medium">Created</th>
              <th className="px-5 py-3" />
            </tr></thead>
            <tbody>
              <AnimatePresence initial={false}>
                {data.items.map((a: any, i: number) => (
                  <motion.tr key={a._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="border-b border-border last:border-0 hover:bg-elevated/40 transition-colors">
                    <td className="px-5 py-3.5"><p className="font-medium truncate max-w-xs">{a.research?.title || a.research?.fileName || "Untitled"}</p></td>
                    <td className="px-5 py-3.5"><Badge variant={a.status === "READY" ? "success" : a.status === "FAILED" ? "danger" : "warning"} dot>{a.status}</Badge></td>
                    <td className="px-5 py-3.5"><span className="text-xs capitalize">{a.sentiment?.label || "—"}</span></td>
                    <td className="px-5 py-3.5 text-muted text-xs">{formatDate(a.createdAt)}</td>
                    <td className="px-5 py-3.5"><Link to={`/app/analysis/${a._id}`}><Button variant="ghost" size="xs" icon={<Eye className="h-3.5 w-3.5" />}>View</Button></Link></td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

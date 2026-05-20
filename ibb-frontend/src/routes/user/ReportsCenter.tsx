import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Empty } from "@/components/ui/Empty";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { FileText, Download, Plus, Clock, CheckCircle2, XCircle } from "lucide-react";
import { formatDate, formatBytes } from "@/lib/utils";

interface Report {
  _id: string; status: "PENDING" | "GENERATING" | "READY" | "FAILED";
  fileSize?: number; createdAt: string;
  research?: { title: string; fileName: string };
  analysis?: { status: string; summary?: string };
}

const statusVariant: Record<string, any> = { READY: "success", GENERATING: "warning", PENDING: "default", FAILED: "danger" };
const statusIcon: Record<string, any> = { READY: CheckCircle2, GENERATING: Clock, PENDING: Clock, FAILED: XCircle };

export default function ReportsCenter() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["reports"],
    queryFn: async () => (await api.get(endpoints.reports.list)).data,
    refetchInterval: 10000,
  });

  const download = async (id: string, filename: string) => {
    try {
      const r = await api.get(endpoints.reports.export(id), { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([r.data]));
      const a = document.createElement("a");
      a.href = url; a.download = filename; a.click();
      window.URL.revokeObjectURL(url);
    } catch {
      toast.error("Download failed — report may not be ready");
    }
  };

  return (
    <div>
      <PageHeader
        title="Reports Center"
        description="Download generated PDF reports with citations and analysis."
        badge={data?.items?.length > 0 && <Badge variant="default">{data.items.length}</Badge>}
      />

      {isLoading ? (
        <SkeletonTable />
      ) : !data?.items?.length ? (
        <Empty
          icon={<FileText className="h-7 w-7 text-muted" />}
          title="No reports yet"
          description="Reports are generated automatically after analysis completes."
        />
      ) : (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border">
                  <th className="px-5 py-3 font-medium">Research</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Size</th>
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {data.items.map((r: Report, i: number) => {
                    const Icon = statusIcon[r.status] || Clock;
                    return (
                      <motion.tr
                        key={r._id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-border last:border-0 hover:bg-elevated/40 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <p className="font-medium line-clamp-1">{r.research?.title || r.research?.fileName || "Untitled"}</p>
                          {r.analysis?.summary && <p className="text-xs text-muted mt-0.5 line-clamp-1">{r.analysis.summary}</p>}
                        </td>
                        <td className="px-5 py-3.5">
                          <Badge variant={statusVariant[r.status]} dot pulse={r.status === "GENERATING"}>
                            {r.status}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-muted font-mono text-xs">
                          {r.fileSize ? formatBytes(r.fileSize) : "—"}
                        </td>
                        <td className="px-5 py-3.5 text-muted text-xs">{formatDate(r.createdAt)}</td>
                        <td className="px-5 py-3.5">
                          <Button
                            variant="outline"
                            size="xs"
                            disabled={r.status !== "READY"}
                            onClick={() => download(r._id, `report-${r._id}.pdf`)}
                            icon={<Download className="h-3.5 w-3.5" />}
                          >
                            Download
                          </Button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

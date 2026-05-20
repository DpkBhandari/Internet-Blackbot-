import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { Modal } from "@/components/ui/Modal";
import { formatBytes, formatDate, cn } from "@/lib/utils";
import { UploadCloud, Trash2, Eye, FileText, FileType, File, BarChart3, CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

interface UploadItem {
  id: string;
  filename: string;
  size: number;
  status: "queued" | "processing" | "ready" | "failed";
  createdAt: string;
  mimeType: string;
}

const ACCEPTED = [".pdf", ".docx", ".txt", ".csv"];
const MAX_MB = 25;

const fileIcon = (filename: string) => {
  const ext = filename.split(".").pop()?.toLowerCase();
  const icons: Record<string, typeof File> = { pdf: FileType, docx: FileText, txt: File, csv: BarChart3 };
  const Icon = icons[ext || ""] || File;
  return <Icon className="h-4 w-4" />;
};

const statusMap: Record<string, { variant: "success" | "warning" | "danger" | "default", icon: typeof CheckCircle2, label: string }> = {
  ready:      { variant: "success", icon: CheckCircle2, label: "Ready" },
  processing: { variant: "warning", icon: Loader2, label: "Processing" },
  queued:     { variant: "default", icon: Clock, label: "Queued" },
  failed:     { variant: "danger",  icon: XCircle, label: "Failed" },
};

export default function UploadCenter() {
  const qc = useQueryClient();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [deleteTarget, setDeleteTarget] = useState<UploadItem | null>(null);

  const list = useQuery({
    queryKey: ["uploads"],
    queryFn: async () => (await api.get<UploadItem[]>(endpoints.uploads.list)).data,
    refetchInterval: 8000,
  });

  const upload = useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      return api.post(endpoints.uploads.create, fd, {
        onUploadProgress: (e) => {
          if (e.total) setProgress((p) => ({ ...p, [file.name]: Math.round((e.loaded / e.total!) * 100) }));
        },
      });
    },
    onSuccess: (_, file) => {
      toast.success(`${file.name} uploaded`);
      setProgress((p) => { const n = { ...p }; delete n[file.name]; return n; });
      qc.invalidateQueries({ queryKey: ["uploads"] });
    },
    onError: (e: any, file) => {
      toast.error(`${file.name}: ${e?.response?.data?.message || "Upload failed"}`);
      setProgress((p) => { const n = { ...p }; delete n[file.name]; return n; });
    },
  });

  const remove = useMutation({
    mutationFn: (id: string) => api.delete(endpoints.uploads.one(id)),
    onSuccess: () => { toast.success("Removed"); qc.invalidateQueries({ queryKey: ["uploads"] }); setDeleteTarget(null); },
    onError: () => toast.error("Delete failed"),
  });

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((f) => {
      const ext = "." + f.name.split(".").pop()?.toLowerCase();
      if (!ACCEPTED.includes(ext)) { toast.error(`${f.name}: unsupported format`); return; }
      if (f.size > MAX_MB * 1024 * 1024) { toast.error(`${f.name}: exceeds ${MAX_MB}MB limit`); return; }
      upload.mutate(f);
    });
  }, [upload]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  return (
    <div>
      <PageHeader
        title="Upload Center"
        description="Upload PDF, DOCX, TXT, or CSV files. Text is extracted and analyzed automatically."
        actions={
          <Button onClick={() => inputRef.current?.click()} icon={<UploadCloud className="h-4 w-4" />}>
            Upload files
          </Button>
        }
      />

      <input ref={inputRef} type="file" multiple accept={ACCEPTED.join(",")} className="hidden"
        onChange={(e) => handleFiles(e.target.files)} />

      {/* Drop zone */}
      <motion.div layout>
        <Card className={cn(
          "mb-6 transition-all duration-200 cursor-pointer",
          dragging && "border-brand/60 bg-brand/5 shadow-glow-sm"
        )}>
          <CardBody>
            <div
              onDragEnter={() => setDragging(true)}
              onDragLeave={() => setDragging(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center py-10"
            >
              <motion.div
                animate={{ scale: dragging ? 1.1 : 1 }}
                className={cn(
                  "h-16 w-16 rounded-2xl flex items-center justify-center mb-4 transition-colors",
                  dragging ? "bg-brand/20 text-brand" : "bg-elevated text-muted"
                )}
              >
                <UploadCloud className={cn("h-7 w-7 transition-transform", dragging && "float")} />
              </motion.div>
              <p className="font-semibold text-base mb-1">
                {dragging ? "Drop files here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-sm text-muted">Accepted: {ACCEPTED.join(", ")} · Max {MAX_MB}MB per file</p>
            </div>

            {/* Upload progress */}
            <AnimatePresence>
              {Object.keys(progress).length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-2.5 border-t border-border pt-4"
                >
                  {Object.entries(progress).map(([name, pct]) => (
                    <div key={name}>
                      <div className="flex justify-between text-xs text-muted mb-1">
                        <span className="truncate max-w-[80%]">{name}</span>
                        <span className="font-mono">{pct}%</span>
                      </div>
                      <div className="h-1.5 bg-elevated rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-brand to-accent rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.2 }}
                        />
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </CardBody>
        </Card>
      </motion.div>

      {/* Files list */}
      {list.isLoading ? (
        <SkeletonTable />
      ) : list.data?.length === 0 ? (
        <Empty
          icon={<UploadCloud className="h-7 w-7 text-muted" />}
          title="No uploads yet"
          description="Drop a file above to get started."
          action={<Button onClick={() => inputRef.current?.click()} size="sm">Upload your first file</Button>}
        />
      ) : (
        <Card>
          <div className="px-5 py-3.5 border-b border-border">
            <CardTitle>Your uploads ({list.data?.length})</CardTitle>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted border-b border-border">
                  <th className="px-5 py-3 font-medium">File</th>
                  <th className="px-5 py-3 font-medium">Size</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium">Uploaded</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {list.data?.map((u, i) => {
                    const s = statusMap[u.status] ?? statusMap.queued;
                    return (
                      <motion.tr
                        key={u.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-border last:border-0 hover:bg-elevated/40 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <span className="text-muted">{fileIcon(u.filename)}</span>
                            <span className="font-medium truncate max-w-[200px]">{u.filename}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-muted font-mono text-xs">{formatBytes(u.size)}</td>
                        <td className="px-5 py-3.5">
                          <Badge variant={s.variant} dot pulse={u.status === "processing"}>
                            {s.label}
                          </Badge>
                        </td>
                        <td className="px-5 py-3.5 text-muted text-xs">{formatDate(u.createdAt)}</td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-1 justify-end">
                            <Button variant="ghost" size="xs" icon={<Eye className="h-3.5 w-3.5" />}>View</Button>
                            <Button variant="ghost" size="xs" className="text-danger hover:bg-danger/10" onClick={() => setDeleteTarget(u)} icon={<Trash2 className="h-3.5 w-3.5" />}>
                              Delete
                            </Button>
                          </div>
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

      {/* Delete confirm modal */}
      <Modal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Delete upload"
        description={`Remove "${deleteTarget?.filename}"? This cannot be undone.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" loading={remove.isPending} onClick={() => deleteTarget && remove.mutate(deleteTarget.id)}>
              Delete
            </Button>
          </>
        }
      >
        <p className="text-sm text-muted">The associated analyses and reports may also be affected.</p>
      </Modal>
    </div>
  );
}

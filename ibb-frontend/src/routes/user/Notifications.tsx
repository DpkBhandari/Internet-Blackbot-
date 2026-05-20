import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { api, endpoints } from "@/lib/api";
import { useNotificationsStore } from "@/stores/notifications";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Empty } from "@/components/ui/Empty";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Bell, CheckCheck, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface Notification {
  _id: string; title: string; message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean; createdAt: string; link?: string;
}

const typeIcon = { info: Info, success: CheckCircle, warning: AlertTriangle, error: XCircle };
const typeVariant: Record<string, any> = { info: "brand", success: "success", warning: "warning", error: "danger" };

export default function Notifications() {
  const qc = useQueryClient();
  const setUnread = useNotificationsStore((s) => s.setUnread);

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const r = await api.get(endpoints.notifications.list);
      setUnread(r.data.unreadCount ?? 0);
      return r.data;
    },
  });

  const readOne = useMutation({
    mutationFn: (id: string) => api.patch(endpoints.notifications.read(id)),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const readAll = useMutation({
    mutationFn: () => api.patch("/notifications/read-all"),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["notifications"] }); setUnread(0); },
  });

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Stay updated on uploads, analyses, and system events."
        badge={data?.unreadCount > 0 && <Badge variant="brand">{data.unreadCount} unread</Badge>}
        actions={
          data?.unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={() => readAll.mutate()} loading={readAll.isPending} icon={<CheckCheck className="h-4 w-4" />}>
              Mark all read
            </Button>
          )
        }
      />

      {isLoading ? (
        <SkeletonTable />
      ) : !data?.items?.length ? (
        <Empty icon={<Bell className="h-7 w-7 text-muted" />} title="No notifications" description="You're all caught up!" />
      ) : (
        <Card>
          <AnimatePresence initial={false}>
            {data.items.map((n: Notification, i: number) => {
              const Icon = typeIcon[n.type] || Info;
              return (
                <motion.div
                  key={n._id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  onClick={() => !n.read && readOne.mutate(n._id)}
                  className={cn(
                    "flex items-start gap-4 px-5 py-4 border-b border-border last:border-0 transition-colors",
                    !n.read ? "bg-brand/3 hover:bg-brand/5 cursor-pointer" : "hover:bg-elevated/30"
                  )}
                >
                  <div className={cn("h-9 w-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5",
                    n.type === "success" && "bg-success/15 text-success",
                    n.type === "warning" && "bg-warning/15 text-warning",
                    n.type === "error" && "bg-danger/15 text-danger",
                    (n.type === "info" || !n.type) && "bg-brand/15 text-brand",
                  )}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className={cn("text-sm font-medium", !n.read && "font-semibold")}>{n.title}</p>
                      {!n.read && <span className="h-1.5 w-1.5 rounded-full bg-brand shrink-0" />}
                    </div>
                    <p className="text-sm text-muted line-clamp-2">{n.message}</p>
                    <p className="text-xs text-muted mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </Card>
      )}
    </div>
  );
}

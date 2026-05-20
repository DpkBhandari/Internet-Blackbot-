import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { formatDate } from "@/lib/utils";
import { History } from "lucide-react";

export default function Activity() {
  const { data, isLoading } = useQuery({
    queryKey: ["activity"],
    queryFn: async () => (await api.get("/dashboard")).data,
  });
  return (
    <div>
      <PageHeader title="Activity" description="Your recent workspace activity." />
      {isLoading ? <SkeletonTable /> : !data?.recent?.length ? (
        <Empty icon={<History className="h-7 w-7 text-muted" />} title="No activity" description="Your recent actions will appear here." />
      ) : (
        <Card>
          {data.recent.map((r: any, i: number) => (
            <div key={r.id} className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-0 hover:bg-elevated/40 transition-colors">
              <div>
                <p className="font-medium text-sm">{r.title}</p>
                <p className="text-xs text-muted">{r.type} · {formatDate(r.createdAt)}</p>
              </div>
              <Badge variant={r.status === "READY" ? "success" : r.status === "FAILED" ? "danger" : "warning"} dot>{r.status}</Badge>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}

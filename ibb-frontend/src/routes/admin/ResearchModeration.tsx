import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { QueryView } from "@/components/feature/QueryView";

export default function ResearchModeration() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["moderation"], queryFn: async () => (await api.get<any[]>(endpoints.admin.moderation)).data });
  const act = useMutation({
    mutationFn: ({ id, action }: any) => api.post(`${endpoints.admin.moderation}/${id}`, { action }),
    onSuccess: () => { toast.success("Updated"); qc.invalidateQueries({ queryKey: ["moderation"] }); },
  });
  return (
    <div>
      <PageHeader title="Research Moderation" description="Review reported analyses and content." />
      <QueryView query={q} emptyCheck={(d) => d.length === 0} emptyTitle="Nothing to moderate">
        {(items) => (
          <div className="space-y-3">
            {items.map((m) => (
              <Card key={m.id}><CardBody>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Badge variant="warning">{m.reason}</Badge>
                    <h3 className="font-medium mt-2">{m.title}</h3>
                    <p className="text-sm text-muted mt-1">{m.snippet}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => act.mutate({ id: m.id, action: "approve" })}>Approve</Button>
                    <Button size="sm" variant="danger" onClick={() => act.mutate({ id: m.id, action: "remove" })}>Remove</Button>
                  </div>
                </div>
              </CardBody></Card>
            ))}
          </div>
        )}
      </QueryView>
    </div>
  );
}

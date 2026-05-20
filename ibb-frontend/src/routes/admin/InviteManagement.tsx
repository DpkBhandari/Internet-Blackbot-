import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { QueryView } from "@/components/feature/QueryView";

export default function InviteManagement() {
  const qc = useQueryClient();
  const [email, setEmail] = useState("");
  const q = useQuery({ queryKey: ["invites"], queryFn: async () => (await api.get<any[]>(endpoints.admin.invites)).data });
  const create = useMutation({
    mutationFn: () => api.post(endpoints.admin.invites, { email }),
    onSuccess: () => { toast.success("Invite sent"); setEmail(""); qc.invalidateQueries({ queryKey: ["invites"] }); },
  });
  return (
    <div>
      <PageHeader title="Invites" description="Invite new users to the platform." />
      <Card className="mb-6"><CardBody className="flex gap-2">
        <Input type="email" placeholder="user@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
        <Button onClick={() => create.mutate()} loading={create.isPending} disabled={!email}>Send invite</Button>
      </CardBody></Card>
      <QueryView query={q} emptyCheck={(d) => d.length === 0}>
        {(items) => (
          <Card>
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted border-b border-border">
                <tr><th className="p-3">Email</th><th className="p-3">Status</th><th className="p-3">Sent</th></tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b border-border last:border-0">
                    <td className="p-3">{i.email}</td>
                    <td className="p-3"><Badge variant={i.status === "accepted" ? "success" : "warning"}>{i.status}</Badge></td>
                    <td className="p-3 text-muted">{new Date(i.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </QueryView>
    </div>
  );
}

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Plus, Trash2, Mail } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function AdminInvites() {
  const qc = useQueryClient();
  const [modal, setModal] = useState(false);
  const [email, setEmail] = useState("");
  const { data, isLoading } = useQuery({ queryKey: ["admin-invites"], queryFn: async () => (await api.get("/admin/invites")).data });
  const create = useMutation({
    mutationFn: () => api.post("/admin/invites", { email }),
    onSuccess: () => { toast.success("Invite sent"); qc.invalidateQueries({ queryKey: ["admin-invites"] }); setModal(false); setEmail(""); },
    onError: (e: any) => toast.error(e?.response?.data?.error || "Failed"),
  });
  const revoke = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/invites/${id}`),
    onSuccess: () => { toast.success("Revoked"); qc.invalidateQueries({ queryKey: ["admin-invites"] }); },
  });
  return (
    <div>
      <PageHeader title="Invites" actions={<Button size="sm" onClick={() => setModal(true)} icon={<Plus className="h-4 w-4" />}>Send invite</Button>} />
      {isLoading ? <SkeletonTable /> : (
        <Card>
          {data?.length === 0 && <div className="py-10 text-center text-sm text-muted">No invites yet.</div>}
          {data?.map((inv: any) => (
            <div key={inv._id} className="flex items-center justify-between px-5 py-3.5 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted" />
                <div>
                  <p className="font-medium text-sm">{inv.email}</p>
                  <p className="text-xs text-muted">Sent {formatDate(inv.createdAt)} · expires {formatDate(inv.expiresAt)}</p>
                </div>
              </div>
              <Button variant="ghost" size="xs" className="text-danger" onClick={() => revoke.mutate(inv._id)} icon={<Trash2 className="h-3.5 w-3.5" />}>Revoke</Button>
            </div>
          ))}
        </Card>
      )}
      <Modal open={modal} onClose={() => setModal(false)} title="Send invite" size="sm"
        footer={<><Button variant="ghost" onClick={() => setModal(false)}>Cancel</Button><Button loading={create.isPending} onClick={() => create.mutate()}>Send</Button></>}>
        <div>
          <label className="block text-sm font-medium mb-1.5">Email address</label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="colleague@example.com" />
        </div>
      </Modal>
    </div>
  );
}

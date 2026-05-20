import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Search, Shield, ShieldOff, Trash2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

export default function AdminUsers() {
  const [q, setQ] = useState("");
  const debouncedQ = useDebounce(q, 400);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["admin-users", debouncedQ],
    queryFn: async () => (await api.get(`/admin/users${debouncedQ ? `?q=${debouncedQ}` : ""}`)).data,
  });

  const updateUser = useMutation({
    mutationFn: ({ id, ...body }: any) => api.patch(`/admin/users/${id}`, body),
    onSuccess: () => { toast.success("User updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: () => toast.error("Update failed"),
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => api.delete(`/admin/users/${id}`),
    onSuccess: () => { toast.success("User deleted"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
    onError: () => toast.error("Delete failed"),
  });

  return (
    <div>
      <PageHeader title="Users" description="Manage platform users and roles." />
      <div className="mb-4 max-w-xs">
        <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search users…" icon={<Search className="h-4 w-4" />} />
      </div>
      {isLoading ? <SkeletonTable /> : (
        <Card>
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted border-b border-border">
              <th className="px-5 py-3 font-medium">Name</th>
              <th className="px-5 py-3 font-medium">Email</th>
              <th className="px-5 py-3 font-medium">Role</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Joined</th>
              <th className="px-5 py-3" />
            </tr></thead>
            <tbody>
              {data?.items?.map((u: any) => (
                <tr key={u._id} className="border-b border-border last:border-0 hover:bg-elevated/40 transition-colors">
                  <td className="px-5 py-3.5 font-medium">{u.name}</td>
                  <td className="px-5 py-3.5 text-muted text-xs">{u.email}</td>
                  <td className="px-5 py-3.5"><Badge variant={u.role === "admin" ? "danger" : "brand"}>{u.role}</Badge></td>
                  <td className="px-5 py-3.5"><Badge variant={u.isActive ? "success" : "default"} dot>{u.isActive ? "Active" : "Suspended"}</Badge></td>
                  <td className="px-5 py-3.5 text-muted text-xs">{formatDate(u.createdAt)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex gap-1">
                      <Button variant="ghost" size="xs" onClick={() => updateUser.mutate({ id: u._id, isActive: !u.isActive })} icon={u.isActive ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}>
                        {u.isActive ? "Suspend" : "Activate"}
                      </Button>
                      <Button variant="ghost" size="xs" className="text-danger hover:bg-danger/10" onClick={() => { if(confirm("Delete user?")) deleteUser.mutate(u._id); }} icon={<Trash2 className="h-3.5 w-3.5" />}>Delete</Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

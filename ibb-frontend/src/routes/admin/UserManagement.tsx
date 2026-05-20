import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { QueryView } from "@/components/feature/QueryView";
import { formatDate } from "@/lib/utils";

export default function UserManagement() {
  const qc = useQueryClient();
  const q = useQuery({ queryKey: ["admin-users"], queryFn: async () => (await api.get<any[]>(endpoints.admin.users)).data });
  const setRole = useMutation({
    mutationFn: ({ id, role }: any) => api.patch(`${endpoints.admin.users}/${id}`, { role }),
    onSuccess: () => { toast.success("Role updated"); qc.invalidateQueries({ queryKey: ["admin-users"] }); },
  });
  return (
    <div>
      <PageHeader title="User Management" description="Manage user accounts and roles." />
      <QueryView query={q} emptyCheck={(d) => d.length === 0}>
        {(items) => (
          <Card>
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted border-b border-border">
                <tr><th className="p-3">User</th><th className="p-3">Email</th><th className="p-3">Role</th><th className="p-3">Joined</th><th></th></tr>
              </thead>
              <tbody>
                {items.map((u) => (
                  <tr key={u.id} className="border-b border-border last:border-0">
                    <td className="p-3 font-medium">{u.name}</td>
                    <td className="p-3 text-muted">{u.email}</td>
                    <td className="p-3"><Badge tone={u.role === "admin" ? "brand" : "neutral"}>{u.role}</Badge></td>
                    <td className="p-3 text-muted">{formatDate(u.createdAt)}</td>
                    <td className="p-3 text-right">
                      <Button size="sm" variant="ghost" onClick={() => setRole.mutate({ id: u.id, role: u.role === "admin" ? "user" : "admin" })}>
                        {u.role === "admin" ? "Demote" : "Promote"}
                      </Button>
                    </td>
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

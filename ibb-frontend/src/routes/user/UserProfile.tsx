import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({ name: z.string().min(2), email: z.string().email() });
type Form = z.infer<typeof schema>;

export default function UserProfile() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const { register, handleSubmit, formState: { isSubmitting, errors } } = useForm<Form>({
    resolver: zodResolver(schema),
    defaultValues: { name: user?.name || "", email: user?.email || "" },
  });
  const onSubmit = async (v: Form) => {
    try { const { data } = await api.patch("/users/me", v); setUser(data.user); toast.success("Profile updated"); }
    catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
  };
  return (
    <div>
      <PageHeader title="Profile" description="Manage your personal information." />
      <Card className="max-w-xl"><CardBody>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div>
            <label className="text-sm">Name</label>
            <Input {...register("name")} />
            {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="text-sm">Email</label>
            <Input type="email" {...register("email")} />
            {errors.email && <p className="text-xs text-danger mt-1">{errors.email.message}</p>}
          </div>
          <Button type="submit" loading={isSubmitting}>Save</Button>
        </form>
      </CardBody></Card>
    </div>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  message: z.string().min(10),
});
type Form = z.infer<typeof schema>;

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });
  const onSubmit = async (v: Form) => {
    try { await api.post("/contact", v); toast.success("Message sent"); reset(); }
    catch (e: any) { toast.error(e?.response?.data?.message || "Failed"); }
  };
  return (
    <div className="max-w-2xl mx-auto px-6 py-20">
      <h1 className="font-display text-4xl font-semibold">Talk to us</h1>
      <p className="text-muted mt-3">Questions, feedback, partnerships — we'd love to hear from you.</p>
      <form className="mt-10 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input placeholder="Your name" {...register("name")} />
        {errors.name && <p className="text-xs text-danger">{errors.name.message}</p>}
        <Input type="email" placeholder="you@company.com" {...register("email")} />
        {errors.email && <p className="text-xs text-danger">{errors.email.message}</p>}
        <Textarea placeholder="How can we help?" rows={6} {...register("message")} />
        {errors.message && <p className="text-xs text-danger">{errors.message.message}</p>}
        <Button type="submit" loading={isSubmitting}>Send message</Button>
      </form>
    </div>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";
import { api, endpoints } from "@/lib/api";
import { Logo } from "@/components/layout/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  password: z.string().min(8, "Min 8 characters"),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });
type Form = z.infer<typeof schema>;

export default function ResetPassword() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Form) => {
    if (!token) { toast.error("Invalid reset link"); return; }
    try {
      await api.post(endpoints.auth.reset, { token, password: v.password });
      toast.success("Password reset successfully!");
      nav("/login");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Reset failed. Link may have expired.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8"><Logo className="justify-center" /></div>
        <div className="glass-heavy rounded-2xl p-8 shadow-float">
          <h1 className="font-display text-2xl font-bold mb-1">Set new password</h1>
          <p className="text-sm text-muted mb-7">Choose a strong password for your account.</p>
          {!token && (
            <div className="p-4 rounded-lg bg-danger/10 border border-danger/20 text-sm text-danger mb-6">
              Invalid or missing reset token. Please request a new link.
            </div>
          )}
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label className="block text-sm font-medium mb-1.5">New password</label>
              <Input type="password" placeholder="Min. 8 characters" icon={<Lock className="h-4 w-4" />} error={!!errors.password} {...register("password")} />
              {errors.password && <p className="text-xs text-danger mt-1.5">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm password</label>
              <Input type="password" placeholder="Repeat password" icon={<Lock className="h-4 w-4" />} error={!!errors.confirm} {...register("confirm")} />
              {errors.confirm && <p className="text-xs text-danger mt-1.5">{errors.confirm.message}</p>}
            </div>
            <Button type="submit" loading={isSubmitting} className="w-full" size="lg" disabled={!token}>Reset password</Button>
          </form>
          <div className="mt-5 text-center">
            <Link to="/login" className="text-sm text-muted hover:text-brand transition-colors">Back to sign in</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

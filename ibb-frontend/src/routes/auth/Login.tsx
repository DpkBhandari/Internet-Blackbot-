import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate, useLocation } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { Logo } from "@/components/layout/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Minimum 6 characters"),
});
type Form = z.infer<typeof schema>;

export default function Login() {
  const login = useAuthStore((s) => s.login);
  const nav = useNavigate();
  const loc = useLocation() as { state?: { from?: string } };
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Form) => {
    try {
      await login(v.email, v.password);
      nav(loc.state?.from || "/app/dashboard", { replace: true });
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Login failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      <div className="absolute inset-0 grid-overlay opacity-20" />
      <div className="absolute top-1/4 left-1/3 h-64 w-64 rounded-full bg-brand/6 blur-3xl float" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8">
          <Logo className="justify-center" />
        </div>

        <div className="glass-heavy rounded-2xl p-8 shadow-float">
          <h1 className="font-display text-2xl font-bold mb-1">Welcome back</h1>
          <p className="text-sm text-muted mb-7">Sign in to your research workspace.</p>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <Input
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                icon={<Mail className="h-4 w-4" />}
                error={!!errors.email}
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-danger mt-1.5">{errors.email.message}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium">Password</label>
                <Link to="/forgot-password" className="text-xs text-brand hover:underline">Forgot password?</Link>
              </div>
              <Input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                icon={<Lock className="h-4 w-4" />}
                error={!!errors.password}
                {...register("password")}
              />
              {errors.password && <p className="text-xs text-danger mt-1.5">{errors.password.message}</p>}
            </div>
            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted">
              No account?{" "}
              <Link to="/register" className="text-brand font-medium hover:underline">
                Create one free
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

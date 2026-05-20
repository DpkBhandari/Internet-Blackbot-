import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/stores/auth";
import { Logo } from "@/components/layout/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Minimum 8 characters"),
  confirm: z.string(),
}).refine(d => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });
type Form = z.infer<typeof schema>;

export default function Register() {
  const register_ = useAuthStore((s) => s.register);
  const nav = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Form) => {
    try {
      await register_(v.name, v.email, v.password);
      nav("/app/dashboard", { replace: true });
      toast.success("Welcome to Internet Black Box!");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-bg relative overflow-hidden">
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      <div className="absolute inset-0 grid-overlay opacity-20" />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="text-center mb-8"><Logo className="justify-center" /></div>

        <div className="glass-heavy rounded-2xl p-8 shadow-float">
          <h1 className="font-display text-2xl font-bold mb-1">Create your workspace</h1>
          <p className="text-sm text-muted mb-7">Start researching with AI-powered intelligence.</p>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label className="block text-sm font-medium mb-1.5">Full name</label>
              <Input type="text" autoComplete="name" placeholder="Jane Doe" icon={<User className="h-4 w-4" />} error={!!errors.name} {...register("name")} />
              {errors.name && <p className="text-xs text-danger mt-1.5">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Email</label>
              <Input type="email" autoComplete="email" placeholder="you@example.com" icon={<Mail className="h-4 w-4" />} error={!!errors.email} {...register("email")} />
              {errors.email && <p className="text-xs text-danger mt-1.5">{errors.email.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <Input type="password" autoComplete="new-password" placeholder="Min. 8 characters" icon={<Lock className="h-4 w-4" />} error={!!errors.password} {...register("password")} />
              {errors.password && <p className="text-xs text-danger mt-1.5">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Confirm password</label>
              <Input type="password" autoComplete="new-password" placeholder="Repeat password" icon={<Lock className="h-4 w-4" />} error={!!errors.confirm} {...register("confirm")} />
              {errors.confirm && <p className="text-xs text-danger mt-1.5">{errors.confirm.message}</p>}
            </div>
            <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
              Create account <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted">
              Already have an account?{" "}
              <Link to="/login" className="text-brand font-medium hover:underline">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

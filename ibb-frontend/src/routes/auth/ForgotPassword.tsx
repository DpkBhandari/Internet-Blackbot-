import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";
import { api, endpoints } from "@/lib/api";
import { Logo } from "@/components/layout/Logo";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

const schema = z.object({ email: z.string().email("Invalid email") });
type Form = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: Form) => {
    try {
      await api.post(endpoints.auth.forgot, v);
      setSentEmail(v.email);
      setSent(true);
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Request failed");
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
          {sent ? (
            <div className="text-center py-4 animate-fade-up">
              <div className="h-16 w-16 rounded-full bg-success/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
              <h2 className="font-display text-xl font-bold mb-2">Check your inbox</h2>
              <p className="text-sm text-muted mb-6">
                We've sent a reset link to <strong>{sentEmail}</strong>. Check your spam folder if you don't see it.
              </p>
              <Link to="/login"><Button variant="outline" className="w-full">Back to sign in</Button></Link>
            </div>
          ) : (
            <>
              <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-text mb-6 transition-colors">
                <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
              </Link>
              <h1 className="font-display text-2xl font-bold mb-1">Reset password</h1>
              <p className="text-sm text-muted mb-7">Enter your email and we'll send you a reset link.</p>
              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Email address</label>
                  <Input type="email" placeholder="you@example.com" icon={<Mail className="h-4 w-4" />} error={!!errors.email} {...register("email")} />
                  {errors.email && <p className="text-xs text-danger mt-1.5">{errors.email.message}</p>}
                </div>
                <Button type="submit" loading={isSubmitting} className="w-full" size="lg">Send reset link</Button>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}

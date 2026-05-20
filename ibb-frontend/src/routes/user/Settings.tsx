import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { api, endpoints } from "@/lib/api";
import { useAuthStore } from "@/stores/auth";
import { useUIStore } from "@/stores/ui";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Sun, Moon, Trash2, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const pwSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8, "Min 8 characters"),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: "Passwords must match", path: ["confirmPassword"] });

const profileSchema = z.object({
  name: z.string().min(2, "Min 2 characters"),
});

export default function Settings() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const theme = useUIStore((s) => s.theme);
  const setTheme = useUIStore((s) => s.setTheme);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleting, setDeleting] = useState(false);
  const nav = useNavigate();

  const pwForm = useForm({ resolver: zodResolver(pwSchema) });
  const profileForm = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name ?? "" } });

  const onChangePw = async (v: any) => {
    try {
      await api.post("/auth/change-password", { currentPassword: v.currentPassword, newPassword: v.newPassword });
      toast.success("Password updated");
      pwForm.reset();
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Failed to update password");
    }
  };

  const onDeleteAccount = async () => {
    if (!deletePassword) { toast.error("Enter your password"); return; }
    setDeleting(true);
    try {
      await api.delete(endpoints.auth.deleteAccount, { data: { password: deletePassword } });
      toast.success("Account deleted");
      await logout();
      nav("/");
    } catch (e: any) {
      toast.error(e?.response?.data?.error || "Delete failed. Check your password.");
    } finally { setDeleting(false); }
  };

  const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your account and preferences." />
      <motion.div variants={stagger} initial="hidden" animate="show" className="space-y-5 max-w-2xl">

        {/* Appearance */}
        <motion.div variants={item}>
          <Card>
            <CardBody>
              <CardTitle className="mb-4">Appearance</CardTitle>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setTheme("light")}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${theme === "light" ? "border-brand bg-brand/10 text-brand" : "border-border hover:border-brand/50"}`}
                >
                  <Sun className="h-4 w-4" /> Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`flex items-center gap-2.5 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all ${theme === "dark" ? "border-brand bg-brand/10 text-brand" : "border-border hover:border-brand/50"}`}
                >
                  <Moon className="h-4 w-4" /> Dark
                </button>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Change Password */}
        <motion.div variants={item}>
          <Card>
            <CardBody>
              <CardTitle className="mb-4 flex items-center gap-2"><Lock className="h-4 w-4 text-muted" /> Change Password</CardTitle>
              <form onSubmit={pwForm.handleSubmit(onChangePw)} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Current password</label>
                  <Input type="password" {...pwForm.register("currentPassword")} error={!!pwForm.formState.errors.currentPassword} />
                  {pwForm.formState.errors.currentPassword && <p className="text-xs text-danger mt-1">{String(pwForm.formState.errors.currentPassword.message)}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">New password</label>
                  <Input type="password" {...pwForm.register("newPassword")} error={!!pwForm.formState.errors.newPassword} />
                  {pwForm.formState.errors.newPassword && <p className="text-xs text-danger mt-1">{String(pwForm.formState.errors.newPassword.message)}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Confirm new password</label>
                  <Input type="password" {...pwForm.register("confirmPassword")} error={!!pwForm.formState.errors.confirmPassword} />
                  {pwForm.formState.errors.confirmPassword && <p className="text-xs text-danger mt-1">{String(pwForm.formState.errors.confirmPassword.message)}</p>}
                </div>
                <Button type="submit" loading={pwForm.formState.isSubmitting} size="sm">Update password</Button>
              </form>
            </CardBody>
          </Card>
        </motion.div>

        {/* Danger zone */}
        <motion.div variants={item}>
          <Card className="border-danger/20">
            <CardBody>
              <CardTitle className="mb-2 text-danger flex items-center gap-2"><Trash2 className="h-4 w-4" /> Danger Zone</CardTitle>
              <p className="text-sm text-muted mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
              <Button variant="danger" size="sm" onClick={() => setDeleteModal(true)} icon={<Trash2 className="h-4 w-4" />}>
                Delete my account
              </Button>
            </CardBody>
          </Card>
        </motion.div>
      </motion.div>

      <Modal
        open={deleteModal}
        onClose={() => { setDeleteModal(false); setDeletePassword(""); }}
        title="Delete account"
        description="This will permanently delete your account, uploads, and all data."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setDeleteModal(false)}>Cancel</Button>
            <Button variant="danger" loading={deleting} onClick={onDeleteAccount}>Delete permanently</Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-danger/8 border border-danger/20 text-sm text-danger">
            This action is irreversible. All your data will be deleted.
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Confirm with your password</label>
            <Input type="password" value={deletePassword} onChange={e => setDeletePassword(e.target.value)} placeholder="Your current password" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

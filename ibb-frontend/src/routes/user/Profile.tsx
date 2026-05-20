import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuthStore } from "@/stores/auth";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Upload, BarChart3, Brain, FileText, Calendar, Mail, Shield, Award, Zap, TrendingUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

const achievements = [
  { id: "first_upload", label: "First Upload", icon: Upload, desc: "Uploaded your first document", check: (d: any) => d?.stats?.uploads >= 1 },
  { id: "analyst", label: "Analyst", icon: BarChart3, desc: "Completed 5+ analyses", check: (d: any) => d?.stats?.analyses >= 5 },
  { id: "researcher", label: "Researcher", icon: Brain, desc: "10+ AI interactions", check: (d: any) => d?.stats?.aiQueries >= 10 },
  { id: "reporter", label: "Reporter", icon: FileText, desc: "Generated a research report", check: (d: any) => d?.stats?.reports >= 1 },
  { id: "power_user", label: "Power User", icon: Zap, desc: "50+ total analyses", check: (d: any) => d?.stats?.analyses >= 50 },
  { id: "top_researcher", label: "Top Researcher", icon: Award, desc: "100+ AI queries", check: (d: any) => d?.stats?.aiQueries >= 100 },
];

export default function Profile() {
  const user = useAuthStore((s) => s.user);

  const { data, isLoading } = useQuery({
    queryKey: ["profile-stats"],
    queryFn: async () => (await api.get("/dashboard")).data,
  });

  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() ?? "U";
  const earned = achievements.filter(a => a.check(data));
  const total = achievements.length;

  return (
    <div>
      <PageHeader title="Profile" description="Your IBB research identity and usage statistics." />

      {/* Hero card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <Card className="overflow-hidden">
          {/* Banner */}
          <div className="h-28 relative mesh-gradient grid-overlay">
            <div className="absolute inset-0 opacity-40" />
          </div>
          <CardBody className="-mt-10 relative">
            <div className="flex items-end gap-5 flex-wrap">
              {/* Avatar */}
              <div className="h-20 w-20 rounded-2xl bg-brand border-4 border-surface flex items-center justify-center text-3xl font-bold text-brand-fg shadow-glow-md shrink-0">
                {initials}
              </div>
              <div className="flex-1 min-w-0 pb-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h2 className="font-display text-xl font-bold">{user?.name ?? "Researcher"}</h2>
                  <Badge variant={user?.role === "admin" ? "danger" : "brand"}>{user?.role ?? "user"}</Badge>
                </div>
                <p className="text-sm text-muted mt-0.5 flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />{user?.email ?? "—"}
                </p>
                {user?.createdAt && (
                  <p className="text-xs text-muted mt-1 flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />Member since {formatDate(user.createdAt)}
                  </p>
                )}
              </div>
            </div>
          </CardBody>
        </Card>
      </motion.div>

      {/* Stats grid */}
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          {[
            { label: "Documents Uploaded", val: data?.stats?.uploads ?? 0, icon: Upload, color: "text-brand", bg: "bg-brand/10" },
            { label: "Analyses Completed", val: data?.stats?.analyses ?? 0, icon: BarChart3, color: "text-success", bg: "bg-success/10" },
            { label: "AI Interactions", val: data?.stats?.aiQueries ?? 0, icon: Brain, color: "text-accent", bg: "bg-accent/10" },
            { label: "Reports Generated", val: data?.stats?.reports ?? 0, icon: FileText, color: "text-warning", bg: "bg-warning/10" },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className="hover:border-brand/30 hover:-translate-y-0.5 transition-all duration-200">
                <CardBody className="flex items-center gap-3">
                  <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", s.bg)}>
                    <s.icon className={cn("h-5 w-5", s.color)} />
                  </div>
                  <div>
                    <p className="text-xs text-muted">{s.label}</p>
                    <p className="text-2xl font-bold font-display count-up">{s.val.toLocaleString()}</p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Achievements */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <Card className="h-full">
            <CardBody>
              <CardTitle className="mb-1 flex items-center gap-2">
                <Award className="h-4 w-4 text-warning" /> Achievements
                <span className="ml-auto text-xs text-muted">{earned.length}/{total}</span>
              </CardTitle>
              <div className="h-1.5 bg-elevated rounded-full overflow-hidden mb-4">
                <div className="h-full bg-gradient-to-r from-brand to-accent rounded-full transition-all" style={{ width: `${(earned.length / total) * 100}%` }} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {achievements.map((a, i) => {
                  const unlocked = a.check(data);
                  const Icon = a.icon;
                  return (
                    <motion.div key={a.id} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.05 }}
                      className={cn("flex items-center gap-2.5 p-2.5 rounded-xl border transition-all",
                        unlocked ? "border-brand/30 bg-brand/5" : "border-border bg-elevated/30 opacity-50")}>
                      <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0",
                        unlocked ? "bg-brand/15 text-brand" : "bg-elevated text-muted")}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold line-clamp-1">{a.label}</p>
                        <p className="text-[10px] text-muted line-clamp-1">{a.desc}</p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Recent activity mini */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardBody>
              <CardTitle className="mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand" /> Recent Activity
              </CardTitle>
              {data?.recent?.length ? (
                <div className="space-y-3">
                  {data.recent.slice(0, 6).map((r: any, i: number) => (
                    <motion.div key={r.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 + i * 0.05 }}
                      className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-brand shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{r.title}</p>
                        <p className="text-xs text-muted">{r.type} · {formatDate(r.createdAt)}</p>
                      </div>
                      <Badge variant={r.status === "READY" ? "success" : r.status === "FAILED" ? "danger" : "warning"} className="text-[10px] shrink-0">
                        {r.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted text-center py-8">No activity yet. Upload your first document!</p>
              )}
            </CardBody>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

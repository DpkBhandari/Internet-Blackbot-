import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Users, FileText, BarChart3, Database } from "lucide-react";

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => (await api.get("/admin/stats")).data,
  });

  const stats = data ? [
    { label: "Total Users", value: data.users, icon: Users },
    { label: "Research Docs", value: data.research, icon: Database },
    { label: "Analyses", value: data.analyses, icon: BarChart3 },
    { label: "Reports", value: data.reports, icon: FileText },
  ] : [];

  return (
    <div>
      <PageHeader title="Admin Dashboard" description="Platform-wide overview." />
      {isLoading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card className="hover:border-brand/30 transition-colors">
                <CardBody className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-brand/10 flex items-center justify-center">
                    <s.icon className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <p className="text-xs text-muted">{s.label}</p>
                    <p className="text-2xl font-bold font-display">{s.value?.toLocaleString() ?? "—"}</p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

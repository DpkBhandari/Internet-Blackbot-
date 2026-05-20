import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Database, Wifi, Clock, Cpu } from "lucide-react";

export default function AdminHealth() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-health"],
    queryFn: async () => (await api.get("/admin/health")).data,
    refetchInterval: 10000,
  });

  return (
    <div>
      <PageHeader title="System Health" description="Real-time service monitoring." />
      {data && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "MongoDB", value: data.mongodb, icon: Database, ok: data.mongodb === "connected" },
            { label: "Redis", value: data.redis, icon: Wifi, ok: data.redis === "connected" },
            { label: "Uptime", value: `${Math.floor(data.uptime / 60)}m ${Math.floor(data.uptime % 60)}s`, icon: Clock, ok: true },
            { label: "Memory (RSS)", value: `${Math.round(data.memory?.rss / 1024 / 1024)}MB`, icon: Cpu, ok: true },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <Card>
                <CardBody className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${s.ok ? "bg-success/10" : "bg-danger/10"}`}>
                    <s.icon className={`h-5 w-5 ${s.ok ? "text-success" : "text-danger"}`} />
                  </div>
                  <div>
                    <p className="text-xs text-muted">{s.label}</p>
                    <p className="font-semibold text-sm">{s.value}</p>
                  </div>
                  <Badge variant={s.ok ? "success" : "danger"} dot pulse={!s.ok} className="ml-auto">
                    {s.ok ? "OK" : "Down"}
                  </Badge>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

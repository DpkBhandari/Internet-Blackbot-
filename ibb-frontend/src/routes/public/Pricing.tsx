import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";

const tiers = [
  { name: "Starter", price: "Free", desc: "For individual researchers.", features: ["50 uploads / mo", "Basic AI analysis", "Community support"] },
  { name: "Pro", price: "$29", desc: "For professionals.", features: ["Unlimited uploads", "Streaming AI assistant", "PDF reports", "Realtime alerts"], featured: true },
  { name: "Team", price: "$99", desc: "For collaborative teams.", features: ["Everything in Pro", "Shared workspaces", "Audit logs", "RBAC + SSO"] },
];

export default function Pricing() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="font-display text-4xl font-semibold text-center">Simple, transparent pricing.</h1>
      <p className="text-muted text-center mt-3">Start free. Upgrade when you scale.</p>
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        {tiers.map((t) => (
          <div key={t.name} className={"p-8 rounded-xl border bg-surface " + (t.featured ? "border-brand shadow-lg shadow-brand/10" : "border-border")}>
            <h3 className="font-display text-xl font-semibold">{t.name}</h3>
            <p className="text-sm text-muted">{t.desc}</p>
            <p className="mt-4 text-4xl font-semibold">{t.price}<span className="text-base text-muted font-normal">/mo</span></p>
            <ul className="mt-6 space-y-2 text-sm">
              {t.features.map((f) => (
                <li key={f} className="flex items-center gap-2"><Check className="h-4 w-4 text-success" /> {f}</li>
              ))}
            </ul>
            <Link to="/register" className="block mt-6"><Button className="w-full" variant={t.featured ? "primary" : "outline"}>Get started</Button></Link>
          </div>
        ))}
      </div>
    </div>
  );
}

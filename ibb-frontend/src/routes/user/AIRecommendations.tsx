import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody, CardTitle } from "@/components/ui/Card";
import { SkeletonCard } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Lightbulb, ExternalLink, ArrowRight, BookOpen, Globe, Search, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Rec { title: string; description: string; type: "topic" | "action" | "source" | "research"; icon: any; cta?: string; ctaLink?: string; }

function buildRecs(items: any[]): Rec[] {
  if (!items.length) return [];
  const recs: Rec[] = [];

  const allKw: Record<string, number> = {};
  items.forEach(a => (a.keywords ?? []).forEach((k: string) => { allKw[k] = (allKw[k] ?? 0) + 1; }));
  const topKws = Object.entries(allKw).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k]) => k);

  topKws.slice(0, 3).forEach(kw => {
    recs.push({
      type: "topic", icon: Search,
      title: `Explore "${kw}" further`,
      description: `This topic appears frequently across your documents. Searching for more research on "${kw}" could reveal deeper context and related findings.`,
      cta: `Search ${kw}`, ctaLink: `/app/search?q=${encodeURIComponent(kw)}`,
    });
  });

  const lowCred = items.filter(a => (a.credibilityScore ?? 0.5) < 0.5);
  if (lowCred.length > 0) {
    recs.push({
      type: "action", icon: Globe,
      title: "Strengthen low-credibility sources",
      description: `${lowCred.length} document${lowCred.length > 1 ? "s have" : " has"} credibility below 50%. Replace or supplement with peer-reviewed sources for stronger research quality.`,
      cta: "View Credibility", ctaLink: "/app/credibility",
    });
  }

  const highMisinfo = items.filter(a => (a.misinformationScore ?? 0) > 0.4);
  if (highMisinfo.length > 0) {
    recs.push({
      type: "action", icon: TrendingUp,
      title: "Fact-check flagged claims",
      description: `${highMisinfo.length} document${highMisinfo.length > 1 ? "s have" : " has"} elevated misinformation scores. Verify claims against authoritative sources before using this content.`,
      cta: "Open Fact Check", ctaLink: "/app/fact-check",
    });
  }

  if (items.length < 5) {
    recs.push({
      type: "research", icon: BookOpen,
      title: "Expand your research corpus",
      description: "With fewer than 5 documents, semantic comparison and trend analysis are limited. Upload additional sources to unlock richer intelligence.",
      cta: "Upload Documents", ctaLink: "/app/upload",
    });
  }

  if (items.length >= 3) {
    recs.push({
      type: "research", icon: Lightbulb,
      title: "Run cross-document comparison",
      description: "Your corpus is ready for semantic comparison. Discover hidden similarities, contradictions, and concept overlaps across your documents.",
      cta: "Open Semantic Match", ctaLink: "/app/semantic",
    });
  }

  recs.push({
    type: "source", icon: Globe,
    title: "Explore Related Academic Sources",
    description: "Use the Research Explorer to find related documents and cross-reference your findings with academic literature for stronger citations.",
    cta: "Research Explorer", ctaLink: "/app/research",
  });

  return recs.slice(0, 8);
}

const typeConfig: Record<string, { color: string; bg: string; label: string }> = {
  topic:    { color: "text-brand",   bg: "bg-brand/10",   label: "Topic" },
  action:   { color: "text-warning", bg: "bg-warning/10", label: "Action" },
  source:   { color: "text-accent",  bg: "bg-accent/10",  label: "Source" },
  research: { color: "text-success", bg: "bg-success/10", label: "Research" },
};

export default function AIRecommendations() {
  const { data, isLoading } = useQuery({
    queryKey: ["ai-recommendations"],
    queryFn: async () => (await api.get("/analyses?status=READY&limit=50")).data,
  });

  if (isLoading) return <div className="space-y-4"><SkeletonCard /><SkeletonCard /></div>;
  const items = data?.items?.filter((a: any) => a.status === "READY") ?? [];
  const recs = buildRecs(items);

  if (!items.length) return (
    <div>
      <PageHeader title="Recommendations" description="AI-generated research guidance, next steps, and resource suggestions." />
      <Empty icon={<Lightbulb className="h-7 w-7 text-muted" />} title="No recommendations yet" description="Upload and analyze documents to receive personalized research guidance." />
    </div>
  );

  return (
    <div>
      <PageHeader title="Recommendations" description="Personalized next steps, research directions, and improvement suggestions."
        badge={<Badge variant="brand">{recs.length} suggestions</Badge>} />

      <div className="grid md:grid-cols-2 gap-4">
        {recs.map((rec, i) => {
          const cfg = typeConfig[rec.type];
          const Icon = rec.icon;
          return (
            <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
              <Card className="h-full hover:border-brand/30 hover:-translate-y-0.5 transition-all duration-200">
                <CardBody className="flex flex-col h-full">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", cfg.bg)}>
                      <Icon className={cn("h-5 w-5", cfg.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className="font-semibold text-sm">{rec.title}</p>
                        <Badge variant="default" className="text-[10px] shrink-0">{cfg.label}</Badge>
                      </div>
                      <p className="text-sm text-muted leading-relaxed">{rec.description}</p>
                    </div>
                  </div>
                  {rec.cta && rec.ctaLink && (
                    <div className="mt-4 pt-3 border-t border-border">
                      <Link to={rec.ctaLink}>
                        <Button variant="outline" size="xs" icon={<ArrowRight className="h-3.5 w-3.5" />}>
                          {rec.cta}
                        </Button>
                      </Link>
                    </div>
                  )}
                </CardBody>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

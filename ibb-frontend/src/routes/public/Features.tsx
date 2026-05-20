import { Brain, BarChart3, ShieldCheck, Sparkles, Network, FileSearch, MessageSquare, Bell, Upload } from "lucide-react";

const items = [
  { icon: Upload, title: "Upload Center", desc: "PDF, DOCX, TXT, CSV with extraction preview and retry." },
  { icon: Brain, title: "AI Assistant", desc: "Streaming chat with context-aware retrieval over your documents." },
  { icon: BarChart3, title: "Sentiment Visualization", desc: "Time-series sentiment plus topic-level breakdowns." },
  { icon: ShieldCheck, title: "Misinformation Tracker", desc: "Cluster claims, score credibility, surface counter-evidence." },
  { icon: Sparkles, title: "Viral Trends", desc: "Detect emerging narratives across sources and platforms." },
  { icon: Network, title: "Semantic Match", desc: "Embeddings-based discovery of related papers and statements." },
  { icon: FileSearch, title: "Source Credibility", desc: "Domain reputation, freshness, and citation graph." },
  { icon: MessageSquare, title: "Collaboration", desc: "Shareable analyses with role-based access." },
  { icon: Bell, title: "Realtime Notifications", desc: "Websocket alerts for analysis completion and new signals." },
];

export default function Features() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      <h1 className="font-display text-4xl font-semibold">Everything you need for AI-powered research.</h1>
      <p className="text-muted mt-3 max-w-2xl">Production-grade infrastructure that scales from a single document to a corpus of millions.</p>
      <div className="grid md:grid-cols-3 gap-6 mt-10">
        {items.map((f) => (
          <div key={f.title} className="p-6 rounded-xl border border-border bg-surface">
            <f.icon className="h-6 w-6 text-brand mb-3" />
            <h3 className="font-display font-semibold">{f.title}</h3>
            <p className="text-sm text-muted mt-2">{f.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

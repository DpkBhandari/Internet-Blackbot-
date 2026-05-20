import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, BarChart3, Brain, ShieldCheck, Sparkles, Network,
  FileSearch, Zap, Globe, Lock, Check, TrendingUp, Search, Upload
} from "lucide-react";
import { Button } from "@/components/ui/Button";

const features = [
  { icon: Brain, title: "AI Research Assistant", desc: "Ask questions across your uploaded corpus and the open web with source-cited answers.", color: "brand" },
  { icon: BarChart3, title: "Sentiment & Trends", desc: "Track sentiment shifts and viral signals across your documents in real time.", color: "success" },
  { icon: ShieldCheck, title: "Misinformation Detection", desc: "Flag low-credibility claims with cited evidence from fact-check databases.", color: "danger" },
  { icon: Network, title: "Semantic Matching", desc: "Find related research papers and statements at scale using vector embeddings.", color: "accent" },
  { icon: FileSearch, title: "Source Verification", desc: "Score every URL by domain reputation, freshness, and semantic relevance.", color: "warning" },
  { icon: Sparkles, title: "Auto Reports", desc: "Generate exportable PDF reports with charts, citations, and evidence summaries.", color: "brand" },
];

const stats = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "<2s", label: "Analysis time" },
  { value: "50+", label: "Sources per query" },
  { value: "4 types", label: "Document formats" },
];

const steps = [
  { icon: Upload, title: "Upload your documents", desc: "PDF, DOCX, TXT, or CSV — any format works." },
  { icon: Search, title: "AI extracts & researches", desc: "Claims are detected, internet is searched, sources are scored." },
  { icon: TrendingUp, title: "Get cited analysis", desc: "Every finding is backed by real URLs and credibility scores." },
];

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } };

export default function Landing() {
  return (
    <div className="overflow-hidden">
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0 mesh-gradient" />
        <div className="absolute inset-0 grid-overlay opacity-30" />
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 h-64 w-64 rounded-full bg-brand/8 blur-3xl float" style={{ animationDelay: "0s" }} />
        <div className="absolute bottom-1/3 right-1/4 h-48 w-48 rounded-full bg-accent/8 blur-3xl float" style={{ animationDelay: "1.5s" }} />

        <div className="relative max-w-7xl mx-auto px-6 py-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-brand/30 bg-brand/8 text-sm text-brand font-medium mb-8"
            >
              <Zap className="h-3.5 w-3.5" />
              Powered by real AI — zero hallucinations
            </motion.div>

            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05] mb-6">
              The intelligence layer
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand via-accent to-brand">
                for the open internet.
              </span>
            </h1>

            <p className="text-xl text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
              Upload documents, detect misinformation, track viral trends, and generate
              source-cited research reports — all from one production-grade workspace.
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/register">
                <Button size="xl" className="shadow-glow-md hover:shadow-glow-lg">
                  Start free <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/docs">
                <Button variant="outline" size="xl">Read docs</Button>
              </Link>
            </div>

            {/* Stat pills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center justify-center gap-6 mt-16 flex-wrap"
            >
              {stats.map((s) => (
                <div key={s.label} className="text-center">
                  <div className="font-display text-2xl font-bold text-brand">{s.value}</div>
                  <div className="text-xs text-muted mt-0.5">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl font-bold mb-4">How it works</h2>
          <p className="text-muted text-lg">Three steps from document to cited intelligence.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line */}
          <div className="absolute top-12 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-border to-transparent hidden md:block" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="text-center relative"
            >
              <div className="relative inline-flex">
                <div className="h-24 w-24 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform">
                  <step.icon className="h-10 w-10 text-brand" />
                </div>
                <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-brand text-brand-fg text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
              </div>
              <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{step.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl font-bold mb-4">Everything you need</h2>
          <p className="text-muted text-lg">A complete research intelligence platform.</p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="group p-6 rounded-2xl border border-border bg-surface hover:border-brand/30 hover:shadow-card-hover transition-all duration-300 cursor-default"
            >
              <div className="h-11 w-11 rounded-xl bg-brand/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <f.icon className="h-5 w-5 text-brand" />
              </div>
              <h3 className="font-display font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden py-32">
        <div className="absolute inset-0 mesh-gradient opacity-60" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="font-display text-4xl font-bold mb-5">
              Built for researchers, journalists, and analysts.
            </h2>
            <p className="text-muted text-lg mb-10">
              Production-grade pipelines. Real data. Real citations. Zero hallucinations.
            </p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link to="/register">
                <Button size="xl" className="shadow-glow-md">Create your workspace <ArrowRight className="h-4 w-4" /></Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="xl">Sign in</Button>
              </Link>
            </div>

            <div className="flex items-center justify-center gap-8 mt-12 text-sm text-muted flex-wrap">
              {["Free to start", "No credit card", "Open source ready", "GDPR compliant"].map((t) => (
                <span key={t} className="flex items-center gap-1.5">
                  <Check className="h-3.5 w-3.5 text-success" /> {t}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}

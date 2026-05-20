import { useRef, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { api, endpoints } from "@/lib/api";
import { useChatStore } from "@/stores/chat";
import { useAuthStore } from "@/stores/auth";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Send, Bot, Trash2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const STARTERS = [
  "Summarize my uploaded research documents",
  "What are the main claims that need fact-checking?",
  "Identify potential misinformation in my documents",
  "What are the key themes across my research?",
];

export default function AIResearchAssistant() {
  const user = useAuthStore((s) => s.user);
  const { messages, sessionId, addMessage, clearMessages } = useChatStore();
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const chat = useMutation({
    mutationFn: async (message: string) => {
      const r = await api.post(endpoints.ai.chat, { message, sessionId });
      return r.data.reply as string;
    },
    onMutate: (message) => {
      addMessage({ role: "user", content: message, ts: Date.now() });
    },
    onSuccess: (reply) => {
      addMessage({ role: "assistant", content: reply, ts: Date.now() });
    },
    onError: (e: any) => {
      addMessage({ role: "assistant", content: `⚠️ Error: ${e?.response?.data?.error || e.message || "Something went wrong"}`, ts: Date.now() });
    },
  });

  const send = (text?: string) => {
    const msg = (text ?? input).trim();
    if (!msg || chat.isPending) return;
    setInput("");
    chat.mutate(msg);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const initials = user?.name?.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase() ?? "U";

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex items-center justify-between mb-4">
        <PageHeader title="AI Research Assistant" description="Ask questions about your documents. Chat persists across navigation." className="mb-0" />
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearMessages} icon={<Trash2 className="h-4 w-4" />}>Clear</Button>
        )}
      </div>

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto scrollbar-thin p-4 space-y-4">
          {messages.length === 0 ? (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center h-full gap-6 text-center py-8">
              <div className="h-16 w-16 rounded-2xl bg-brand/10 flex items-center justify-center float">
                <Sparkles className="h-7 w-7 text-brand" />
              </div>
              <div>
                <h3 className="font-display font-semibold text-lg mb-2">AI Research Assistant</h3>
                <p className="text-sm text-muted max-w-sm">Ask about your documents, request analysis, or explore research topics. Chat is saved across navigation.</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-2 w-full max-w-md">
                {STARTERS.map(s => (
                  <button key={s} onClick={() => send(s)}
                    className="text-left px-3 py-2.5 rounded-lg border border-border hover:border-brand/50 hover:bg-brand/5 text-sm text-muted hover:text-text transition-all duration-150">
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((m) => (
                <motion.div key={m.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                  <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold mt-0.5",
                    m.role === "user" ? "bg-brand/15 text-brand" : "bg-elevated text-muted")}>
                    {m.role === "user" ? initials : <Bot className="h-4 w-4" />}
                  </div>
                  <div className={cn("max-w-[80%] rounded-2xl px-4 py-3 text-sm",
                    m.role === "user" ? "bg-brand text-brand-fg rounded-tr-sm" : "bg-elevated rounded-tl-sm")}>
                    {m.role === "assistant" ? (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}
                        className="prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-li:my-0">
                        {m.content}
                      </ReactMarkdown>
                    ) : m.content}
                  </div>
                </motion.div>
              ))}
              {chat.isPending && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                  <div className="h-8 w-8 rounded-lg bg-elevated flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-muted" />
                  </div>
                  <div className="bg-elevated rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <Spinner size="sm" /><span className="text-sm text-muted">Thinking…</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="border-t border-border p-4">
          <div className="flex gap-3">
            <input ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), send())}
              placeholder="Ask a question about your research…"
              disabled={chat.isPending}
              className="flex-1 h-10 rounded-lg border border-border bg-elevated px-3 text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand transition-all" />
            <Button onClick={() => send()} disabled={!input.trim() || chat.isPending} loading={chat.isPending}
              icon={<Send className="h-4 w-4" />}>Send</Button>
          </div>
          <p className="text-[10px] text-muted mt-2">Chat is saved locally and survives page navigation.</p>
        </div>
      </Card>
    </div>
  );
}

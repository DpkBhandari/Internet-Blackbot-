import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { SkeletonTable } from "@/components/ui/Skeleton";
import { Empty } from "@/components/ui/Empty";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { History, Bot, User, Search, Trash2, Download } from "lucide-react";
import { formatDateFull, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/useDebounce";

interface Message { _id: string; role: "user" | "assistant"; content: string; sessionId: string; createdAt: string; }

export default function ChatHistory() {
  const [q, setQ] = useState("");
  const [activeSession, setActiveSession] = useState<string | null>(null);
  const dq = useDebounce(q, 300);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["chat-history", dq],
    queryFn: async () => (await api.get(`/ai/history?limit=200`)).data,
  });

  if (isLoading) return <div><PageHeader title="Chat History" /><SkeletonTable /></div>;

  const msgs: Message[] = data?.items ?? [];

  // Group by session
  const sessions: Record<string, Message[]> = {};
  msgs.forEach(m => {
    if (!sessions[m.sessionId]) sessions[m.sessionId] = [];
    sessions[m.sessionId].push(m);
  });

  const filteredSessions = Object.entries(sessions).filter(([sid, msgs]) => {
    if (!dq) return true;
    return msgs.some(m => m.content.toLowerCase().includes(dq.toLowerCase()));
  });

  const exportSession = (sid: string, msgs: Message[]) => {
    const text = msgs.map(m => `[${m.role.toUpperCase()}] ${formatDateFull(m.createdAt)}\n${m.content}`).join("\n\n---\n\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `chat-${sid.slice(0, 8)}.txt`; a.click();
    URL.revokeObjectURL(url);
    toast.success("Chat exported");
  };

  if (!msgs.length) return (
    <div>
      <PageHeader title="Chat History" description="All previous AI research conversations." />
      <Empty icon={<History className="h-7 w-7 text-muted" />} title="No chat history" description="Start a conversation with the AI Assistant to see history here." />
    </div>
  );

  const activeMessages = activeSession ? (sessions[activeSession] ?? []) : [];

  return (
    <div>
      <PageHeader title="Chat History" description={`${Object.keys(sessions).length} conversation${Object.keys(sessions).length !== 1 ? "s" : ""}, ${msgs.length} messages`}
        badge={<Badge variant="brand">{msgs.length} messages</Badge>} />

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Session list */}
        <div className="lg:col-span-1">
          <div className="mb-3">
            <Input value={q} onChange={e => setQ(e.target.value)} placeholder="Search conversations…" icon={<Search className="h-4 w-4" />} />
          </div>
          <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto scrollbar-thin pr-1">
            {filteredSessions.length === 0 ? (
              <p className="text-sm text-muted text-center py-8">No conversations match "{q}"</p>
            ) : filteredSessions.map(([sid, smgs], i) => {
              const firstUser = smgs.find(m => m.role === "user");
              const lastMsg = smgs[smgs.length - 1];
              return (
                <motion.button key={sid} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  onClick={() => setActiveSession(activeSession === sid ? null : sid)}
                  className={cn("w-full text-left p-3.5 rounded-xl border transition-all",
                    activeSession === sid ? "border-brand/50 bg-brand/5" : "border-border bg-surface hover:border-brand/30 hover:bg-elevated/50")}>
                  <div className="flex items-start gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-brand/15 flex items-center justify-center shrink-0">
                      <Bot className="h-4 w-4 text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{firstUser?.content ?? "Conversation"}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <p className="text-xs text-muted">{formatDate(lastMsg.createdAt)}</p>
                        <Badge variant="default" className="text-[10px]">{smgs.length} msg</Badge>
                      </div>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Message viewer */}
        <div className="lg:col-span-2">
          {!activeSession ? (
            <Card className="h-64 flex items-center justify-center">
              <CardBody className="flex flex-col items-center gap-3 text-center">
                <History className="h-10 w-10 text-muted float" />
                <p className="text-sm text-muted">Select a conversation to view messages</p>
              </CardBody>
            </Card>
          ) : (
            <Card>
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm">Session {activeSession.slice(0, 8)}…</p>
                  <p className="text-xs text-muted">{activeMessages.length} messages</p>
                </div>
                <Button variant="outline" size="xs" onClick={() => exportSession(activeSession, activeMessages)}
                  icon={<Download className="h-3.5 w-3.5" />}>Export</Button>
              </div>
              <div className="p-4 space-y-3 max-h-[calc(100vh-20rem)] overflow-y-auto scrollbar-thin">
                <AnimatePresence initial={false}>
                  {activeMessages.map((m, i) => (
                    <motion.div key={m._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                      className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                      <div className={cn("h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold mt-0.5",
                        m.role === "user" ? "bg-brand/15 text-brand" : "bg-elevated text-muted")}>
                        {m.role === "user" ? "U" : <Bot className="h-3.5 w-3.5" />}
                      </div>
                      <div className={cn("max-w-[80%] rounded-xl px-3.5 py-2.5 text-sm",
                        m.role === "user" ? "bg-brand text-brand-fg rounded-tr-sm" : "bg-elevated rounded-tl-sm")}>
                        <p className="leading-relaxed">{m.content}</p>
                        <p className={cn("text-[10px] mt-1", m.role === "user" ? "text-brand-fg/60" : "text-muted")}>
                          {formatDateFull(m.createdAt)}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

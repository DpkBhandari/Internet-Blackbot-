import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function SemanticMatchDashboard() {
  const [text, setText] = useState("");
  const m = useMutation({ mutationFn: async () => (await api.post(endpoints.analyses.semantic, { text })).data });
  return (
    <div>
      <PageHeader title="Semantic Match" description="Find semantically similar passages across your documents and the web." />
      <Card className="max-w-3xl mb-4"><CardBody>
        <Textarea placeholder="Paste a passage…" value={text} onChange={(e) => setText(e.target.value)} />
        <Button className="mt-3" onClick={() => m.mutate()} loading={m.isPending} disabled={!text.trim()}>Find matches</Button>
      </CardBody></Card>
      {m.data && (
        <div className="space-y-3">
          {m.data.matches?.map((it: any, i: number) => (
            <Card key={i}><CardBody>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="brand">{Math.round(it.score * 100)}% match</Badge>
                {it.source && <span className="text-xs text-muted">{it.source}</span>}
              </div>
              <p className="text-sm">{it.text}</p>
            </CardBody></Card>
          ))}
        </div>
      )}
    </div>
  );
}

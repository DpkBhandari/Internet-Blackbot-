import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function FactCheckCenter() {
  const [claim, setClaim] = useState("");
  const m = useMutation({
    mutationFn: async () => (await api.post(endpoints.sources.factcheck, { claim })).data,
    onError: () => toast.error("Fact check failed"),
  });
  return (
    <div>
      <PageHeader title="Fact Check Center" description="Submit a claim and get evidence-based verification." />
      <Card className="max-w-3xl"><CardBody>
        <Textarea placeholder="Paste a claim or statement…" value={claim} onChange={(e) => setClaim(e.target.value)} />
        <Button className="mt-3" onClick={() => m.mutate()} loading={m.isPending} disabled={!claim.trim()}>Run fact check</Button>
        {m.data && (
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant={m.data.verdict === "true" ? "success" : m.data.verdict === "false" ? "danger" : "warning"}>Verdict: {m.data.verdict}</Badge>
              <span className="text-sm text-muted">Confidence {Math.round((m.data.confidence || 0) * 100)}%</span>
            </div>
            <p className="text-sm">{m.data.explanation}</p>
            {m.data.evidence?.map((e: any, i: number) => (
              <Card key={i}><CardBody>
                <a href={e.url} target="_blank" rel="noreferrer" className="text-brand text-sm">{e.title}</a>
                <p className="text-sm text-muted mt-1">{e.excerpt}</p>
              </CardBody></Card>
            ))}
          </div>
        )}
      </CardBody></Card>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { QueryView } from "@/components/feature/QueryView";
import { useDebounce } from "@/hooks/useDebounce";

export default function ResearchExplorer() {
  const [q, setQ] = useState("");
  const dq = useDebounce(q, 400);
  const query = useQuery({
    queryKey: ["research", dq],
    queryFn: async () => (await api.get<any[]>("/research", { params: { q: dq } })).data,
  });
  return (
    <div>
      <PageHeader title="Research Explorer" description="Browse research papers and cited evidence." />
      <Input className="mb-6" placeholder="Search papers, authors, topics…" value={q} onChange={(e) => setQ(e.target.value)} />
      <QueryView query={query} emptyCheck={(d) => d.length === 0}>
        {(items) => (
          <div className="grid md:grid-cols-2 gap-4">
            {items.map((r) => (
              <Card key={r.id}><CardBody>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="brand">{r.year}</Badge>
                  <span className="text-xs text-muted">{r.venue}</span>
                </div>
                <h3 className="font-display font-semibold">{r.title}</h3>
                <p className="text-sm text-muted mt-1">{r.authors?.join(", ")}</p>
                <p className="text-sm mt-3 line-clamp-3">{r.abstract}</p>
                <a href={r.url} target="_blank" rel="noreferrer" className="text-sm text-brand mt-3 inline-block">Open paper →</a>
              </CardBody></Card>
            ))}
          </div>
        )}
      </QueryView>
    </div>
  );
}

import { useQuery } from "@tanstack/react-query";
import { api, endpoints } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { QueryView } from "@/components/feature/QueryView";

export default function CitationViewer() {
  const q = useQuery({ queryKey: ["citations"], queryFn: async () => (await api.get<any[]>(endpoints.sources.citations)).data });
  return (
    <div>
      <PageHeader title="Citation Viewer" description="All citations referenced across your reports." />
      <QueryView query={q} emptyCheck={(d) => d.length === 0}>
        {(items) => (
          <div className="space-y-2">
            {items.map((c) => (
              <Card key={c.id}><CardBody>
                <p className="text-sm">{c.formatted}</p>
                {c.url && <a href={c.url} target="_blank" rel="noreferrer" className="text-xs text-brand">{c.url}</a>}
              </CardBody></Card>
            ))}
          </div>
        )}
      </QueryView>
    </div>
  );
}

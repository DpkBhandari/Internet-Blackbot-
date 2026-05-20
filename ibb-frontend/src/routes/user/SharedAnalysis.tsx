import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card, CardBody } from "@/components/ui/Card";
import { QueryView } from "@/components/feature/QueryView";

export default function SharedAnalysis() {
  const { id } = useParams();
  const q = useQuery({ queryKey: ["shared", id], queryFn: async () => (await api.get(`/shared/${id}`)).data });
  return (
    <div>
      <PageHeader title="Shared Analysis" description="View an analysis shared with you." />
      <QueryView query={q}>
        {(d: any) => <Card><CardBody><pre className="text-sm whitespace-pre-wrap">{JSON.stringify(d, null, 2)}</pre></CardBody></Card>}
      </QueryView>
    </div>
  );
}

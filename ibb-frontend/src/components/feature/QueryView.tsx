import { type UseQueryResult } from "@tanstack/react-query";
import { Spinner } from "@/components/ui/Spinner";
import { ErrorState } from "@/components/ui/ErrorState";
import { Empty } from "@/components/ui/Empty";

interface Props<T> {
  query: UseQueryResult<T, Error>;
  children: (data: T) => React.ReactNode;
  emptyCheck?: (data: T) => boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  loadingFallback?: React.ReactNode;
}

export function QueryView<T>({
  query, children, emptyCheck, emptyTitle, emptyDescription, loadingFallback,
}: Props<T>) {
  if (query.isLoading) {
    return loadingFallback ?? (
      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    );
  }
  if (query.isError) {
    return <ErrorState message={(query.error as any)?.response?.data?.error || query.error?.message} onRetry={() => query.refetch()} />;
  }
  if (query.data === undefined || query.data === null) {
    return <Empty title={emptyTitle} description={emptyDescription} />;
  }
  if (emptyCheck && emptyCheck(query.data)) {
    return <Empty title={emptyTitle} description={emptyDescription} />;
  }
  return <>{children(query.data)}</>;
}

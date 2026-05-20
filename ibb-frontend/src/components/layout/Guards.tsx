import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { PageLoader } from "@/components/ui/Spinner";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const loc = useLocation();
  if (status === "idle" || status === "loading") return <PageLoader />;
  if (status === "unauthenticated") return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  return <>{children}</>;
}

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const loc = useLocation();
  if (status === "idle" || status === "loading") return <PageLoader />;
  if (status === "unauthenticated") return <Navigate to="/login" state={{ from: loc.pathname }} replace />;
  if (user?.role !== "admin") return <Navigate to="/app/dashboard" replace />;
  return <>{children}</>;
}

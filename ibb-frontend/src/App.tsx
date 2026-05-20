import { lazy, Suspense, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/stores/auth";
import { PageLoader } from "@/components/ui/Spinner";
import { ProtectedRoute, AdminRoute } from "@/components/layout/Guards";
import CommandPalette from "@/components/feature/CommandPalette";
import { useUIStore } from "@/stores/ui";

// ── Lazy imports ────────────────────────────────────────────────────────────
const PublicLayout   = lazy(() => import("@/layouts/PublicLayout"));
const AppLayout      = lazy(() => import("@/layouts/AppLayout"));
const AdminLayout    = lazy(() => import("@/layouts/AdminLayout"));

const Landing        = lazy(() => import("@/routes/public/Landing"));
const Login          = lazy(() => import("@/routes/auth/Login"));
const Register       = lazy(() => import("@/routes/auth/Register"));
const ForgotPassword = lazy(() => import("@/routes/auth/ForgotPassword"));
const ResetPassword  = lazy(() => import("@/routes/auth/ResetPassword"));

const Dashboard      = lazy(() => import("@/routes/user/Dashboard"));
const UploadCenter   = lazy(() => import("@/routes/user/UploadCenter"));
const AnalysisCenter = lazy(() => import("@/routes/user/AnalysisCenter"));
const AnalysisView   = lazy(() => import("@/routes/user/AnalysisView"));
const SearchResults  = lazy(() => import("@/routes/user/SearchResults"));
const Notifications  = lazy(() => import("@/routes/user/Notifications"));
const ReportsCenter  = lazy(() => import("@/routes/user/ReportsCenter"));
const Settings       = lazy(() => import("@/routes/user/Settings"));
const Profile        = lazy(() => import("@/routes/user/Profile"));
const Activity       = lazy(() => import("@/routes/user/Activity"));
const AIAssistant    = lazy(() => import("@/routes/user/AIResearchAssistant"));
const AIInsights     = lazy(() => import("@/routes/user/AIInsights"));
const AIRecommendations = lazy(() => import("@/routes/user/AIRecommendations"));
const ChatHistory    = lazy(() => import("@/routes/user/ChatHistory"));
const SentimentPage  = lazy(() => import("@/routes/user/SentimentPage"));
const TrendsPage     = lazy(() => import("@/routes/user/TrendsPage"));
const MisinfoPage    = lazy(() => import("@/routes/user/MisinfoPage"));
const ResearchPage   = lazy(() => import("@/routes/user/ResearchPage"));
const SourcesPage    = lazy(() => import("@/routes/user/SourcesPage"));
const CredibilityPage= lazy(() => import("@/routes/user/CredibilityPage"));
const FactCheckPage  = lazy(() => import("@/routes/user/FactCheckPage"));
const CitationsPage  = lazy(() => import("@/routes/user/CitationsPage"));
const SemanticPage   = lazy(() => import("@/routes/user/SemanticPage"));

const AdminDashboard = lazy(() => import("@/routes/admin/AdminDashboard"));
const AdminUsers     = lazy(() => import("@/routes/admin/AdminUsers"));
const AdminLogs      = lazy(() => import("@/routes/admin/AdminLogs"));
const AdminHealth    = lazy(() => import("@/routes/admin/AdminHealth"));
const AdminInvites   = lazy(() => import("@/routes/admin/AdminInvites"));
const AdminAnalytics = lazy(() => import("@/routes/admin/AdminAnalytics"));

const S = <T,>(C: React.LazyExoticComponent<() => JSX.Element>) => (
  <Suspense fallback={<PageLoader />}><C /></Suspense>
);

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const status  = useAuthStore((s) => s.status);
  const cmdOpen = useUIStore((s) => s.commandOpen);

  // Validate token on mount
  useEffect(() => { if (status === "authenticated") fetchMe(); }, []);

  return (
    <>
      {cmdOpen && <CommandPalette />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route element={<PublicLayout />}>
            <Route path="/"              element={<Landing />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/register"      element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password"  element={<ResetPassword />} />
          </Route>

          {/* App */}
          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/app/dashboard"           element={<Dashboard />} />
            <Route path="/app/upload"              element={<UploadCenter />} />
            <Route path="/app/analysis"            element={<AnalysisCenter />} />
            <Route path="/app/analysis/:id"        element={<AnalysisView />} />
            <Route path="/app/search"              element={<SearchResults />} />
            <Route path="/app/notifications"       element={<Notifications />} />
            <Route path="/app/reports"             element={<ReportsCenter />} />
            <Route path="/app/settings"            element={<Settings />} />
            <Route path="/app/profile"             element={<Profile />} />
            <Route path="/app/activity"            element={<Activity />} />
            <Route path="/app/ai/assistant"        element={<AIAssistant />} />
            <Route path="/app/ai/insights"         element={<AIInsights />} />
            <Route path="/app/ai/recommendations"  element={<AIRecommendations />} />
            <Route path="/app/ai/history" element={<ChatHistory />} />
            <Route path="/app/sentiment"           element={<SentimentPage />} />
            <Route path="/app/trends"              element={<TrendsPage />} />
            <Route path="/app/misinformation"      element={<MisinfoPage />} />
            <Route path="/app/research"            element={<ResearchPage />} />
            <Route path="/app/sources"             element={<SourcesPage />} />
            <Route path="/app/credibility"         element={<CredibilityPage />} />
            <Route path="/app/fact-check"          element={<FactCheckPage />} />
            <Route path="/app/citations"           element={<CitationsPage />} />
            <Route path="/app/semantic"            element={<SemanticPage />} />
          </Route>

          {/* Admin */}
          <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin/dashboard"   element={<AdminDashboard />} />
            <Route path="/admin/users"       element={<AdminUsers />} />
            <Route path="/admin/logs"        element={<AdminLogs />} />
            <Route path="/admin/health"      element={<AdminHealth />} />
            <Route path="/admin/invites"     element={<AdminInvites />} />
            <Route path="/admin/analytics"   element={<AdminAnalytics />} />
            <Route path="/admin/api-monitor" element={<AdminHealth />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </>
  );
}

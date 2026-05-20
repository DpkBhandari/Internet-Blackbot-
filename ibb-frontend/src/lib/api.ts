import axios, { type AxiosRequestConfig } from "axios";
import { useAuthStore } from "@/stores/auth";

const BASE = import.meta.env.VITE_API_BASE_URL || "/api";

export const api = axios.create({
  baseURL: BASE,
  withCredentials: true,
  timeout: 60000,
});

// Attach access token
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto-refresh on 401
let refreshing: Promise<void> | null = null;
api.interceptors.response.use(
  (r) => r,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      if (!refreshing) {
        refreshing = useAuthStore.getState().refreshTokens().finally(() => { refreshing = null; });
      }
      try {
        await refreshing;
        const token = useAuthStore.getState().accessToken;
        if (token) original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const endpoints = {
  auth: {
    login:         "/auth/login",
    register:      "/auth/register",
    me:            "/auth/me",
    logout:        "/auth/logout",
    refresh:       "/auth/refresh",
    forgot:        "/auth/forgot-password",
    reset:         "/auth/reset-password",
    deleteAccount: "/auth/delete",
  },
  uploads: {
    list:         "/uploads",
    create:       "/uploads",
    one:  (id: string) => `/uploads/${id}`,
  },
analyses: {
  list:           "/analyses",
  one:    (id: string) => `/analyses/${id}`,
  summary:(id: string) => `/analyses/${id}/summary`,

  sentiment:      "/analyses/sentiment",
  trends:         "/analyses/trends",
  credibility:    "/analyses/credibility",
  misinformation: "/analyses/misinformation",
  semantic:       "/analyses/semantic",
},
activity: "/activity",

sources: {
  list: "/sources",
  citations: "/sources/citations",
  factcheck: "/sources/factcheck",
},
  reports: {
    list:         "/reports",
    create:       "/reports",
    one:  (id: string) => `/reports/${id}`,
    export: (id: string) => `/reports/${id}/export`,
  },
  notifications: {
    list:         "/notifications",
    read: (id: string) => `/notifications/${id}/read`,
    readAll:      "/notifications/read-all",
  },
  ai: {
    chat:           "/ai/chat",
    history:        "/ai/history",
    insights:       "/ai/insights",
    recommendations:"/ai/recommendations",
  },
  search:           "/search",
  dashboard:        "/dashboard",
 admin: {
  stats:      "/admin/stats",
  users:      "/admin/users",
  invites:    "/admin/invites",
  logs:       "/admin/logs",
  health:     "/admin/health",
  analytics:  "/admin/analytics",

  apiMonitor: "/admin/api-monitor",
  errors:     "/admin/errors",
  moderation: "/admin/moderation",
},
};

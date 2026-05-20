import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, endpoints } from "@/lib/api";

interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
  createdAt?: string;
}

type AuthStatus = "idle" | "loading" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  status: AuthStatus;
  setUser: (user: User | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshTokens: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      status: "idle",
      setUser: (user) => set({ user }),
      login: async (email, password) => {
        set({ status: "loading" });
        const r = await api.post(endpoints.auth.login, { email, password });
        set({
          user: r.data.user,
          accessToken: r.data.accessToken,
          status: "authenticated",
        });
      },

      register: async (name, email, password) => {
        set({ status: "loading" });
        const r = await api.post(endpoints.auth.register, {
          name,
          email,
          password,
        });
        set({
          user: r.data.user,
          accessToken: r.data.accessToken,
          status: "authenticated",
        });
      },

      logout: async () => {
        try {
          await api.post(endpoints.auth.logout);
        } catch {
          /* ignore */
        }
        set({ user: null, accessToken: null, status: "unauthenticated" });
      },

      refreshTokens: async () => {
        const r = await api.post(endpoints.auth.refresh);
        set({ accessToken: r.data.accessToken });
      },

      fetchMe: async () => {
        const { accessToken } = get();
        if (!accessToken) {
          set({ status: "unauthenticated" });
          return;
        }
        try {
          set({ status: "loading" });
          const r = await api.get(endpoints.auth.me);
          set({ user: r.data, status: "authenticated" });
        } catch {
          set({ user: null, accessToken: null, status: "unauthenticated" });
        }
      },
    }),
    {
      name: "ibb-auth",
      partialize: (s) => ({ user: s.user, accessToken: s.accessToken }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          state.status = "authenticated";
        } else {
          state!.status = "unauthenticated";
        }
      },
    },
  ),
);

import { create } from "zustand";
interface State {
  unread: number;
  setUnread: (n: number) => void;
  increment: () => void;
  decrement: () => void;
}
export const useNotificationsStore = create<State>((set) => ({
  unread: 0,
  setUnread: (n) => set({ unread: n }),
  increment: () => set((s) => ({ unread: s.unread + 1 })),
  decrement: () => set((s) => ({ unread: Math.max(0, s.unread - 1) })),
}));

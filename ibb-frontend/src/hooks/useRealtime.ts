import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useAuthStore } from "@/stores/auth";
import { useNotificationsStore } from "@/stores/notifications";
import { useQueryClient } from "@tanstack/react-query";

export function useRealtime() {
  const token = useAuthStore((s) => s.accessToken);
  const addUnread = useNotificationsStore((s) => s.increment);
  const qc = useQueryClient();

  useEffect(() => {
    if (!token) return;

    socket.auth = { token };
    socket.connect();

    socket.on("notification", () => {
      addUnread();
      qc.invalidateQueries({ queryKey: ["notifications"] });
    });

    socket.on("analysis:done", () => {
      qc.invalidateQueries({ queryKey: ["uploads"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
    });

    socket.on("report:ready", () => {
      qc.invalidateQueries({ queryKey: ["reports"] });
    });

    return () => {
      socket.off("notification");
      socket.off("analysis:done");
      socket.off("report:ready");
      socket.disconnect();
    };
  }, [token]);
}

import { useEffect } from "react";
export function useHotkey(combo: string, handler: (e: KeyboardEvent) => void) {
  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      const parts = combo.toLowerCase().split("+");
      const wantMeta = parts.includes("mod") || parts.includes("cmd") || parts.includes("ctrl");
      const wantShift = parts.includes("shift");
      const key = parts[parts.length - 1];
      const meta = e.metaKey || e.ctrlKey;
      if (wantMeta && !meta) return;
      if (wantShift && !e.shiftKey) return;
      if (e.key.toLowerCase() === key) { e.preventDefault(); handler(e); }
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [combo, handler]);
}

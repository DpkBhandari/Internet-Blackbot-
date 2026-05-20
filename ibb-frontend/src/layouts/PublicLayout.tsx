import { Outlet, Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/Button";
import { Github } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/docs", label: "Docs" },
  { to: "/about", label: "About" },
];

export default function PublicLayout() {
  const loc = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      {/* Navbar */}
      <header className="h-16 sticky top-0 z-40 border-b border-border bg-surface/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center gap-6">
          <Logo />
          <nav className="hidden md:flex items-center gap-0.5 ml-4">
            {navLinks.map(l => (
              <Link
                key={l.to}
                to={l.to}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-sm transition-colors",
                  loc.pathname === l.to ? "text-text font-medium" : "text-muted hover:text-text hover:bg-elevated"
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign in</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="border-t border-border bg-surface py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-sm text-muted">© {new Date().getFullYear()} Internet Black Box. AI-powered research intelligence.</p>
          <nav className="flex gap-4 text-sm text-muted">
            {navLinks.map(l => <Link key={l.to} to={l.to} className="hover:text-text transition-colors">{l.label}</Link>)}
          </nav>
        </div>
      </footer>
    </div>
  );
}

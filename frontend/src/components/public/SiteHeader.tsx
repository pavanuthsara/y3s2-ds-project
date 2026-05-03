import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X, Activity } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
] as const;

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent-gradient shadow-glow transition-base group-hover:scale-105">
            <Activity className="h-5 w-5 text-primary-foreground" strokeWidth={2.5} />
          </span>
          <span className="font-display text-xl font-bold tracking-tight">
            Nexa<span className="text-gradient">Health</span>
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={
                pathname === l.to
                  ? "px-4 py-2 text-sm font-semibold text-foreground rounded-lg bg-muted"
                  : "px-4 py-2 text-sm font-medium text-muted-foreground rounded-lg hover:text-foreground hover:bg-muted transition-base"
              }
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2">
          <Link to="/patient" className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-base">
            Sign in
          </Link>
          <Link to="/patient" className="rounded-full bg-secondary px-5 py-2.5 text-sm font-semibold text-secondary-foreground shadow-soft hover:opacity-90 transition-base">
            Get started
          </Link>
        </div>

        <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-lg hover:bg-muted" aria-label="Menu">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col p-4 gap-1">
            {links.map((l) => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-muted">
                {l.label}
              </Link>
            ))}
            <Link to="/patient" onClick={() => setOpen(false)} className="mt-2 rounded-full bg-secondary px-5 py-3 text-sm font-semibold text-secondary-foreground text-center">
              Get started
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}

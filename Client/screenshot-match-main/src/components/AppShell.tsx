import { Link } from "@tanstack/react-router";
import { BarChart3, CalendarClock, Clapperboard, LayoutGrid, Percent, Ticket } from "lucide-react";
import type { ReactNode } from "react";

const nav = [
  { to: "/", label: "Showcase", icon: CalendarClock },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { to: "/admin", label: "Admin", icon: Percent },
  { to: "/tickets", label: "Tickets", icon: Ticket },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen md:flex">
      <aside className="sticky top-0 z-20 border-b bg-sidebar backdrop-blur-xl md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <div className="flex items-center gap-2 px-5 py-4 md:py-6">
          <div className="grid size-9 place-items-center rounded-lg bg-gradient-neon shadow-neon">
            <Clapperboard className="size-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Cinema<span className="text-gradient">Hub</span>
          </span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 md:flex-col md:pb-0">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              activeOptions={{ exact: true }}
              className="flex shrink-0 items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground data-[status=active]:bg-sidebar-accent data-[status=active]:text-primary"
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 px-4 py-6 md:px-10 md:py-10">{children}</main>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle: string; actions?: ReactNode }) {
  return (
    <div className="mb-8 flex flex-col gap-4 animate-rise md:flex-row md:items-end md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {actions}
    </div>
  );
}

export function Kpi({ label, value, accent }: { label: string; value: string; accent: "cyan" | "violet" | "emerald" | "amber" }) {
  const color = { cyan: "bg-neon-cyan", violet: "bg-neon-violet", emerald: "bg-neon-emerald", amber: "bg-neon-amber" }[accent];
  return (
    <div className="glass glass-hover relative overflow-hidden p-5 animate-rise">
      <div className={`absolute -right-6 -top-6 size-20 rounded-full opacity-30 blur-2xl ${color}`} />
      <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold">{value}</p>
    </div>
  );
}

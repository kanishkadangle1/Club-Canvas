import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import {
  LayoutDashboard, Wand2, Image as ImageIcon, BarChart3, Users, FileText,
  LogOut, Plus, ChevronDown, Sparkles, CalendarDays,
} from "lucide-react";
import { toast } from "sonner";

type Club = { id: string; name: string; slug: string };

export function AppShell({
  clubId,
  children,
  title,
  actions,
}: {
  clubId?: string;
  children: ReactNode;
  title?: string;
  actions?: ReactNode;
}) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (r) => r.location.pathname });

  const { data: clubs = [] } = useQuery<Club[]>({
    queryKey: ["myClubs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_members")
        .select("clubs(id, name, slug)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r: any) => r.clubs).filter(Boolean);
    },
    enabled: !!user,
  });

  const currentClub = clubs.find((c) => c.id === clubId);

  const nav = clubId
    ? [
        { to: `/club/${clubId}`, icon: LayoutDashboard, label: "Overview", exact: true },
        { to: `/club/${clubId}/events`, icon: CalendarDays, label: "Events" },
        { to: `/club/${clubId}/generator`, icon: Wand2, label: "AI Studio" },
        { to: `/club/${clubId}/documents`, icon: FileText, label: "Documents" },
        { to: `/club/${clubId}/gallery`, icon: ImageIcon, label: "Gallery" },
        { to: `/club/${clubId}/analytics`, icon: BarChart3, label: "Analytics" },
        { to: `/club/${clubId}/team`, icon: Users, label: "Team" },
      ]
    : [{ to: "/dashboard", icon: LayoutDashboard, label: "Dashboard", exact: true }];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="min-h-screen bg-background bg-mesh flex">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 border-r border-white/5 bg-background/60 backdrop-blur-md flex-col p-4 gap-6 sticky top-0 h-screen">
        <div className="px-2 pt-2"><Logo /></div>

        {currentClub && (
          <div className="glass rounded-xl p-3">
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Workspace</div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium truncate">{currentClub.name}</span>
              <ChevronDown className="size-3.5 text-muted-foreground" />
            </div>
          </div>
        )}

        <nav className="flex flex-col gap-1">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-1 px-3">
            {clubId ? "Workspace" : "Main"}
          </div>
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                isActive(n.to, n.exact)
                  ? "bg-accent text-foreground ring-1 ring-white/10"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
              }`}
            >
              <n.icon className="size-4 shrink-0" />
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-2">
          <Link to="/dashboard" className="text-xs text-muted-foreground hover:text-foreground px-3 py-2 flex items-center gap-2">
            <Plus className="size-3.5" /> Switch workspace
          </Link>
          <button
            onClick={async () => { await signOut(); toast.success("Signed out"); navigate({ to: "/" }); }}
            className="text-xs text-muted-foreground hover:text-foreground px-3 py-2 flex items-center gap-2"
          >
            <LogOut className="size-3.5" /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-30 h-14 border-b border-white/5 bg-background/70 backdrop-blur-md flex items-center justify-between px-6">
          <div className="flex items-center gap-3 text-sm">
            {title && <span className="font-medium">{title}</span>}
          </div>
          <div className="flex items-center gap-3">
            {actions}
            <div className="size-7 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center text-[11px] font-semibold">
              {(user?.email ?? "?").slice(0, 1).toUpperCase()}
            </div>
          </div>
        </header>
        <div className="flex-1 p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

export function GhostButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className={`glass text-sm font-medium px-3 py-1.5 rounded-lg hover:bg-accent transition ${rest.className ?? ""}`}>
      {children}
    </button>
  );
}

export function PrimaryButton({ children, ...rest }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...rest} className={`inline-flex items-center gap-2 bg-[var(--accent-purple)] text-white text-sm font-medium px-3.5 py-1.5 rounded-lg ring-1 ring-[color-mix(in_oklab,var(--accent-purple)_50%,transparent)] glow-purple hover:brightness-110 disabled:opacity-50 transition ${rest.className ?? ""}`}>
      <Sparkles className="size-3.5" />
      {children}
    </button>
  );
}

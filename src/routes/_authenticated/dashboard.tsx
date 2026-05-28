import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell, PrimaryButton } from "@/components/AppShell";
import { toast } from "sonner";
import { Plus, FileText, Calendar, Users, ArrowRight, Sparkles, X } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Club Documentor" }] }),
  component: Dashboard,
});

type Club = {
  id: string; name: string; slug: string; description: string | null; created_at: string;
};

function Dashboard() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const { data: clubs = [], isLoading } = useQuery<Club[]>({
    queryKey: ["myClubs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_members")
        .select("clubs(id, name, slug, description, created_at)")
        .eq("user_id", user!.id);
      if (error) throw error;
      return (data ?? []).map((r: any) => r.clubs).filter(Boolean);
    },
    enabled: !!user,
  });

  return (
    <AppShell title="Dashboard" actions={
      <PrimaryButton onClick={() => setOpen(true)}>New Workspace</PrimaryButton>
    }>
      <div className="max-w-6xl mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-semibold tracking-tight">Your workspaces</h1>
          <p className="text-muted-foreground mt-1">Manage every club you&apos;re part of in one place.</p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => <div key={i} className="glass rounded-2xl h-44 animate-pulse" />)}
          </div>
        ) : clubs.length === 0 ? (
          <EmptyState onCreate={() => setOpen(true)} />
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clubs.map((c) => (
              <Link key={c.id} to="/club/$clubId" params={{ clubId: c.id }} className="group glass rounded-2xl p-6 hover:ring-1 hover:ring-[color-mix(in_oklab,var(--accent-purple)_40%,transparent)] transition-all">
                <div className="size-10 rounded-lg bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] mb-4 flex items-center justify-center text-white font-semibold">
                  {c.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="font-medium text-lg">{c.name}</div>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description || "No description"}</p>
                <div className="mt-5 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(c.created_at).toLocaleDateString()}</span>
                  <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
            <button onClick={() => setOpen(true)} className="glass rounded-2xl p-6 border-dashed border border-border/60 hover:border-[var(--accent-purple)]/40 flex flex-col items-center justify-center text-muted-foreground hover:text-foreground transition-all">
              <Plus className="size-6 mb-2" />
              <span className="text-sm font-medium">Create workspace</span>
            </button>
          </div>
        )}

        {/* Quick highlights */}
        <div className="mt-12 grid md:grid-cols-3 gap-4">
          <Stat icon={FileText} label="AI generations" value="∞" sub="Unlimited on all plans" />
          <Stat icon={Calendar} label="Realtime collab" value="On" sub="Multi-user docs" />
          <Stat icon={Users} label="Roles" value="4" sub="Lead, Coord, Member, Faculty" />
        </div>
      </div>

      {open && (
        <CreateClubModal
          onClose={() => setOpen(false)}
          onCreated={(club) => {
            qc.invalidateQueries({ queryKey: ["myClubs"] });
            setOpen(false);
            navigate({ to: "/club/$clubId", params: { clubId: club.id } });
          }}
        />
      )}
    </AppShell>
  );
}

function Stat({ icon: Icon, label, value, sub }: any) {
  return (
    <div className="glass rounded-xl p-5">
      <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-widest">
        <Icon className="size-3.5" /> {label}
      </div>
      <div className="text-2xl font-semibold mt-2">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{sub}</div>
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="glass-strong rounded-3xl p-12 text-center gradient-border">
      <Sparkles className="size-8 mx-auto mb-4 text-[var(--accent-purple)]" />
      <h2 className="text-xl font-semibold">Create your first workspace</h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-md mx-auto">
        Spin up a workspace for your club. You&apos;ll be its Documentation Lead and can invite teammates next.
      </p>
      <button onClick={onCreate} className="mt-6 inline-flex items-center gap-2 bg-[var(--accent-purple)] text-white text-sm font-medium px-4 py-2 rounded-lg glow-purple hover:brightness-110">
        <Plus className="size-4" /> New Workspace
      </button>
    </div>
  );
}

function CreateClubModal({ onClose, onCreated }: { onClose: () => void; onCreated: (c: Club) => void }) {
  const { user } = useAuth();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Math.random().toString(36).slice(2, 6);
      const { data, error } = await supabase
        .from("clubs")
        .insert({ name, description, slug, owner_id: user!.id })
        .select()
        .single();
      if (error) throw error;
      toast.success(`Workspace "${name}" created`);
      onCreated(data as Club);
    } catch (err: any) {
      toast.error(err.message ?? "Failed to create workspace");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/70 backdrop-blur-sm flex items-center justify-center p-4 no-print" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
        className="glass-strong rounded-2xl p-6 w-full max-w-md gradient-border"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">New workspace</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Club name</label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full bg-input/40 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--accent-purple)] outline-none" placeholder="Robotics Society" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Short description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="mt-1 w-full bg-input/40 border border-border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[var(--accent-purple)] outline-none" placeholder="What does this club do?" />
          </div>
        </div>
        <button disabled={busy} className="mt-5 w-full inline-flex items-center justify-center gap-2 bg-[var(--accent-purple)] text-white text-sm font-medium py-2.5 rounded-lg glow-purple hover:brightness-110 disabled:opacity-50">
          {busy ? "Creating…" : "Create workspace"}
        </button>
      </form>
    </div>
  );
}

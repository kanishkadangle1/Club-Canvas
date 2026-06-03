import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "motion/react";
import { CalendarDays, MapPin, Plus, Sparkles, ArrowUpRight, Clock, Archive } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PrimaryButton, GhostButton } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/club/$clubId/events/")({
  head: () => ({ meta: [{ title: "Events — Club Documentor" }] }),
  component: EventsPage,
});

type EventRow = {
  id: string; title: string; description: string | null; event_date: string | null;
  location: string | null; status: string; created_at: string;
};

function EventsPage() {
  const { clubId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "upcoming" | "archive">("all");

  const { data: events = [], isLoading } = useQuery<EventRow[]>({
    queryKey: ["events-list", clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("events").select("*").eq("club_id", clubId)
        .order("event_date", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const now = Date.now();
  const filtered = events.filter((e) => {
    if (filter === "all") return true;
    const t = e.event_date ? new Date(e.event_date).getTime() : 0;
    return filter === "upcoming" ? t >= now : t < now;
  });

  return (
    <AppShell
      clubId={clubId}
      title="Events"
      actions={<PrimaryButton onClick={() => setOpen(true)}><Plus className="size-3.5" /> New event</PrimaryButton>}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="relative glass rounded-3xl p-8 overflow-hidden"
        >
          <div className="absolute -top-24 -right-24 size-72 rounded-full bg-[var(--accent-purple)]/20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 size-72 rounded-full bg-[var(--accent-blue)]/20 blur-3xl" />
          <div className="relative">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground bg-white/5 ring-1 ring-white/10 rounded-full px-3 py-1 mb-3">
              <Sparkles className="size-3" /> Event Documentation System
            </div>
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              Document every event from <span className="bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)] bg-clip-text text-transparent">brief to highlights</span>.
            </h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Plan the schedule, capture moments, track attendance — and turn it all into polished reports, captions, and letters with AI.
            </p>
          </div>
        </motion.div>

        {/* Filter pills */}
        <div className="flex items-center gap-2">
          {(["all", "upcoming", "archive"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition ${
                filter === f
                  ? "bg-[var(--accent-purple)] text-white glow-purple"
                  : "glass text-muted-foreground hover:text-foreground"
              }`}
            >
              {f === "archive" ? <span className="inline-flex items-center gap-1.5"><Archive className="size-3" /> Archive</span> : f}
            </button>
          ))}
          <span className="text-xs text-muted-foreground ml-2">{filtered.length} events</span>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="glass rounded-2xl h-56 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass rounded-2xl p-12 text-center">
            <CalendarDays className="size-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No events yet. Create your first one to start documenting.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((e, i) => {
              const date = e.event_date ? new Date(e.event_date) : null;
              const past = date && date.getTime() < now;
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <Link
                    to="/club/$clubId/events/$eventId"
                    params={{ clubId, eventId: e.id }}
                    className="group block relative glass rounded-2xl p-5 hover:ring-1 hover:ring-[var(--accent-purple)]/40 transition overflow-hidden h-full"
                  >
                    <div className="absolute -top-12 -right-12 size-32 rounded-full bg-[var(--accent-purple)]/10 blur-2xl group-hover:bg-[var(--accent-purple)]/25 transition" />
                    <div className="relative flex items-start justify-between mb-3">
                      <div className="size-10 rounded-xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex flex-col items-center justify-center text-white">
                        <span className="text-[9px] uppercase leading-none opacity-80">{date ? date.toLocaleString("en", { month: "short" }) : "TBD"}</span>
                        <span className="text-sm font-bold leading-none">{date ? date.getDate() : "—"}</span>
                      </div>
                      <span className={`text-[10px] uppercase tracking-widest px-2 py-1 rounded-full ring-1 ${
                        past ? "bg-white/5 text-muted-foreground ring-white/10" : "bg-emerald-500/10 text-emerald-300 ring-emerald-500/20"
                      }`}>{past ? "Archived" : e.status}</span>
                    </div>
                    <h3 className="relative font-semibold text-base leading-tight mb-1.5">{e.title}</h3>
                    <p className="relative text-xs text-muted-foreground line-clamp-2 mb-4">
                      {e.description || "No description yet."}
                    </p>
                    <div className="relative flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><Clock className="size-3" /> {date ? date.toLocaleString("en", { hour: "numeric", minute: "2-digit" }) : "—"}</span>
                      {e.location && <span className="inline-flex items-center gap-1 truncate max-w-[140px]"><MapPin className="size-3" /> {e.location}</span>}
                      <ArrowUpRight className="size-3.5 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {open && (
        <CreateEventModal
          clubId={clubId}
          userId={user!.id}
          onClose={() => setOpen(false)}
          onCreated={(id) => {
            qc.invalidateQueries({ queryKey: ["events-list", clubId] });
            setOpen(false);
            navigate({ to: "/club/$clubId/events/$eventId", params: { clubId, eventId: id } });
          }}
        />
      )}
    </AppShell>
  );
}

function CreateEventModal({
  clubId, userId, onClose, onCreated,
}: { clubId: string; userId: string; onClose: () => void; onCreated: (id: string) => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("events")
      .insert({
        club_id: clubId, title, description: description || null,
        event_date: date ? new Date(date).toISOString() : null,
        location: location || null, created_by: userId, status: "upcoming",
      }).select("id").single();
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Event created");
    onCreated(data!.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="glass rounded-2xl w-full max-w-lg p-6 ring-1 ring-white/10"
      >
        <h2 className="text-lg font-semibold mb-4">Create event</h2>
        <div className="space-y-3">
          <input
            value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title"
            className="w-full bg-white/5 ring-1 ring-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-[var(--accent-purple)]/50"
          />
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description"
            rows={3}
            className="w-full bg-white/5 ring-1 ring-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-[var(--accent-purple)]/50 resize-none"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)}
              className="bg-white/5 ring-1 ring-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-[var(--accent-purple)]/50"
            />
            <input
              value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location"
              className="bg-white/5 ring-1 ring-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-[var(--accent-purple)]/50"
            />
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 mt-5">
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <PrimaryButton onClick={submit} disabled={saving || !title.trim()}>
            {saving ? "Creating…" : "Create event"}
          </PrimaryButton>
        </div>
      </motion.div>
    </div>
  );
}

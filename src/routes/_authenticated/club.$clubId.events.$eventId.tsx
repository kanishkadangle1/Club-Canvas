import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CalendarDays, MapPin, Clock, ArrowLeft, Plus, Users, Image as ImageIcon,
  FileText, Sparkles, Wand2, Mic2, Trash2, Upload, CheckCircle2, Circle,
  Linkedin, Instagram, Award, ListChecks, Bot, X, Loader2, ScrollText,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PrimaryButton, GhostButton } from "@/components/AppShell";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { generateDocument } from "@/lib/ai.functions";
import { renderMarkdown, exportDOCX } from "@/lib/export-utils";

export const Route = createFileRoute("/_authenticated/club/$clubId/events/$eventId")({
  head: () => ({ meta: [{ title: "Event Workspace — Club Documentor" }] }),
  component: EventWorkspace,
});

type Ev = { id: string; club_id: string; title: string; description: string | null;
  event_date: string | null; location: string | null; status: string };
type Session = { id: string; title: string; speaker: string | null; description: string | null;
  start_time: string | null; end_time: string | null; order_index: number };
type Attendee = { id: string; name: string; email: string | null; attended: boolean; checked_in_at: string | null };
type Doc = { id: string; title: string; doc_type: string; content: string; created_at: string };
type Photo = { id: string; url: string; caption: string | null; created_at: string };

type Tab = "overview" | "timeline" | "media" | "documents" | "team" | "insights";

function EventWorkspace() {
  const { clubId, eventId } = Route.useParams();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("overview");
  const [aiOpen, setAiOpen] = useState(false);

  const { data: ev } = useQuery<Ev | null>({
    queryKey: ["event", eventId],
    queryFn: async () => {
      const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single();
      if (error) throw error;
      return data as Ev;
    },
  });

  const { data: sessions = [] } = useQuery<Session[]>({
    queryKey: ["sessions", eventId],
    queryFn: async () => {
      const { data } = await supabase.from("event_sessions").select("*")
        .eq("event_id", eventId).order("order_index", { ascending: true });
      return (data ?? []) as Session[];
    },
  });

  const { data: attendees = [] } = useQuery<Attendee[]>({
    queryKey: ["attendees", eventId],
    queryFn: async () => {
      const { data } = await supabase.from("event_attendees").select("*")
        .eq("event_id", eventId).order("created_at", { ascending: false });
      return (data ?? []) as Attendee[];
    },
  });

  const { data: photos = [] } = useQuery<Photo[]>({
    queryKey: ["event-photos", eventId],
    queryFn: async () => {
      const { data } = await supabase.from("photos").select("*")
        .eq("event_id", eventId).order("created_at", { ascending: false });
      return (data ?? []) as Photo[];
    },
  });

  const { data: docs = [] } = useQuery<Doc[]>({
    queryKey: ["event-docs", eventId],
    queryFn: async () => {
      const { data } = await supabase.from("documents").select("*")
        .eq("event_id", eventId).order("created_at", { ascending: false });
      return (data ?? []) as Doc[];
    },
  });

  const presentCount = attendees.filter((a) => a.attended).length;
  const attendanceRate = attendees.length ? Math.round((presentCount / attendees.length) * 100) : 0;
  const date = ev?.event_date ? new Date(ev.event_date) : null;

  const tabs: { id: Tab; label: string; icon: typeof CalendarDays; count?: number }[] = [
    { id: "overview", label: "Overview", icon: Sparkles },
    { id: "timeline", label: "Timeline", icon: Clock, count: sessions.length },
    { id: "media", label: "Media", icon: ImageIcon, count: photos.length },
    { id: "documents", label: "Documents", icon: FileText, count: docs.length },
    { id: "team", label: "Attendance", icon: Users, count: attendees.length },
    { id: "insights", label: "AI Insights", icon: Bot },
  ];

  return (
    <AppShell
      clubId={clubId}
      title="Event Workspace"
      actions={
        <PrimaryButton onClick={() => setAiOpen(true)}>
          <Wand2 className="size-3.5" /> AI Studio
        </PrimaryButton>
      }
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <Link to="/club/$clubId/events" params={{ clubId }}
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mb-3">
            <ArrowLeft className="size-3" /> All events
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className="relative glass rounded-3xl p-6 md:p-8 overflow-hidden"
          >
            <div className="absolute -top-32 -right-20 size-80 rounded-full bg-[var(--accent-purple)]/15 blur-3xl" />
            <div className="absolute -bottom-32 -left-20 size-80 rounded-full bg-[var(--accent-blue)]/15 blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-start md:justify-between gap-5">
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span className="inline-flex items-center gap-1.5 bg-white/5 ring-1 ring-white/10 rounded-full px-2.5 py-1">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {ev?.status ?? "—"}
                  </span>
                  {date && <span className="inline-flex items-center gap-1.5"><CalendarDays className="size-3" /> {date.toLocaleString("en", { dateStyle: "medium", timeStyle: "short" })}</span>}
                  {ev?.location && <span className="inline-flex items-center gap-1.5"><MapPin className="size-3" /> {ev.location}</span>}
                </div>
                <h1 className="text-2xl md:text-4xl font-semibold tracking-tight">{ev?.title ?? "Loading…"}</h1>
                <p className="text-muted-foreground mt-2 max-w-2xl">{ev?.description || "Add a description to give your team and AI more context."}</p>
              </div>
              <div className="grid grid-cols-3 gap-3 md:min-w-[340px]">
                <Stat label="Sessions" value={sessions.length} />
                <Stat label="Photos" value={photos.length} />
                <Stat label="Attendance" value={`${attendanceRate}%`} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm transition whitespace-nowrap ${
                tab === t.id ? "bg-white/10 text-foreground ring-1 ring-white/10" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <t.icon className="size-3.5" />
              {t.label}
              {typeof t.count === "number" && (
                <span className="text-[10px] bg-white/10 rounded-full px-1.5 py-0.5">{t.count}</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {tab === "overview" && <OverviewTab ev={ev ?? null} sessions={sessions} photos={photos} docs={docs} attendanceRate={attendanceRate} onJump={setTab} />}
            {tab === "timeline" && <TimelineTab clubId={clubId} eventId={eventId} userId={user!.id} sessions={sessions} qc={qc} />}
            {tab === "media" && <MediaTab clubId={clubId} eventId={eventId} userId={user!.id} photos={photos} qc={qc} />}
            {tab === "documents" && <DocumentsTab clubId={clubId} docs={docs} />}
            {tab === "team" && <AttendanceTab clubId={clubId} eventId={eventId} userId={user!.id} attendees={attendees} qc={qc} />}
            {tab === "insights" && <InsightsTab ev={ev ?? null} sessions={sessions} attendees={attendees} photos={photos} clubId={clubId} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {aiOpen && ev && (
        <AIStudioPanel
          ev={ev} sessions={sessions} attendees={attendees} photos={photos} userId={user!.id}
          onClose={() => setAiOpen(false)}
          onSaved={() => { qc.invalidateQueries({ queryKey: ["event-docs", eventId] }); }}
        />
      )}
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="glass rounded-xl p-3">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="text-xl font-semibold mt-0.5 bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">{value}</div>
    </div>
  );
}

/* -------------------- OVERVIEW -------------------- */
function OverviewTab({ ev, sessions, photos, docs, attendanceRate, onJump }: {
  ev: Ev | null; sessions: Session[]; photos: Photo[]; docs: Doc[]; attendanceRate: number;
  onJump: (t: Tab) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-sm">Next on the schedule</h3>
          <button onClick={() => onJump("timeline")} className="text-xs text-[var(--accent-purple)] hover:underline">View timeline →</button>
        </div>
        {sessions.length === 0 ? (
          <EmptyHint icon={Clock} text="No sessions yet. Add your event timeline." />
        ) : (
          <ol className="relative border-l border-white/10 pl-5 space-y-4">
            {sessions.slice(0, 4).map((s) => (
              <li key={s.id} className="relative">
                <span className="absolute -left-[26px] top-1 size-3 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] ring-4 ring-background" />
                <div className="text-[11px] text-muted-foreground">{s.start_time ? new Date(s.start_time).toLocaleTimeString("en", { hour: "numeric", minute: "2-digit" }) : "TBD"}</div>
                <div className="font-medium text-sm">{s.title}</div>
                {s.speaker && <div className="text-xs text-muted-foreground inline-flex items-center gap-1"><Mic2 className="size-3" />{s.speaker}</div>}
              </li>
            ))}
          </ol>
        )}
      </div>
      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold text-sm mb-4">Quick stats</h3>
        <div className="space-y-3 text-sm">
          <Row label="Attendance" value={`${attendanceRate}%`} />
          <Row label="Photos" value={photos.length} />
          <Row label="Documents" value={docs.length} />
          <Row label="Sessions" value={sessions.length} />
        </div>
      </div>

      <div className="lg:col-span-2 glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Media preview</h3>
          <button onClick={() => onJump("media")} className="text-xs text-[var(--accent-purple)] hover:underline">Open gallery →</button>
        </div>
        {photos.length === 0 ? (
          <EmptyHint icon={ImageIcon} text="No photos yet. Upload event moments to enrich AI reports." />
        ) : (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
            {photos.slice(0, 8).map((p) => (
              <div key={p.id} className="aspect-square rounded-lg overflow-hidden bg-white/5 group">
                <img src={p.url} alt={p.caption ?? ""} className="w-full h-full object-cover group-hover:scale-105 transition" />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold text-sm mb-4">Generated documents</h3>
        {docs.length === 0 ? <EmptyHint icon={FileText} text="Run AI Studio to generate reports, captions, and letters." /> : (
          <ul className="space-y-2">
            {docs.slice(0, 5).map((d) => (
              <li key={d.id} className="flex items-center gap-3 text-sm">
                <FileText className="size-3.5 text-muted-foreground" />
                <span className="truncate flex-1">{d.title}</span>
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{d.doc_type}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function EmptyHint({ icon: Icon, text }: { icon: typeof Clock; text: string }) {
  return (
    <div className="text-center py-8 text-xs text-muted-foreground">
      <Icon className="size-5 mx-auto mb-2 opacity-60" />
      {text}
    </div>
  );
}

/* -------------------- TIMELINE -------------------- */
function TimelineTab({ clubId, eventId, userId, sessions, qc }: {
  clubId: string; eventId: string; userId: string; sessions: Session[]; qc: ReturnType<typeof useQueryClient>;
}) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [speaker, setSpeaker] = useState("");
  const [start, setStart] = useState("");
  const [desc, setDesc] = useState("");

  const add = async () => {
    if (!title.trim()) return;
    const { error } = await supabase.from("event_sessions").insert({
      event_id: eventId, club_id: clubId, title, speaker: speaker || null,
      description: desc || null, start_time: start ? new Date(start).toISOString() : null,
      order_index: sessions.length, created_by: userId,
    });
    if (error) return toast.error(error.message);
    setTitle(""); setSpeaker(""); setStart(""); setDesc(""); setAdding(false);
    qc.invalidateQueries({ queryKey: ["sessions", eventId] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("event_sessions").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["sessions", eventId] });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-semibold">Schedule & Speakers</h3>
          <PrimaryButton onClick={() => setAdding(true)}><Plus className="size-3.5" /> Add session</PrimaryButton>
        </div>
        {sessions.length === 0 && !adding ? (
          <EmptyHint icon={Clock} text="Build your event timeline. Each session can include a speaker and description." />
        ) : (
          <ol className="relative border-l border-white/10 pl-6 space-y-5">
            {sessions.map((s) => (
              <li key={s.id} className="relative group">
                <span className="absolute -left-[30px] top-1.5 size-4 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] ring-4 ring-background shadow-[0_0_20px_var(--accent-purple)]" />
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[11px] text-muted-foreground">
                      {s.start_time ? new Date(s.start_time).toLocaleString("en", { dateStyle: "medium", timeStyle: "short" }) : "Time TBD"}
                    </div>
                    <div className="font-medium">{s.title}</div>
                    {s.speaker && <div className="text-xs text-muted-foreground inline-flex items-center gap-1.5 mt-0.5"><Mic2 className="size-3" />{s.speaker}</div>}
                    {s.description && <p className="text-xs text-muted-foreground mt-1.5">{s.description}</p>}
                  </div>
                  <button onClick={() => remove(s.id)} className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-red-400">
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="glass rounded-2xl p-5 h-fit">
        <h3 className="font-semibold text-sm mb-3">{adding ? "New session" : "Tips"}</h3>
        {adding ? (
          <div className="space-y-2">
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Session title"
              className="w-full bg-white/5 ring-1 ring-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-[var(--accent-purple)]/50" />
            <input value={speaker} onChange={(e) => setSpeaker(e.target.value)} placeholder="Speaker (optional)"
              className="w-full bg-white/5 ring-1 ring-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-[var(--accent-purple)]/50" />
            <input type="datetime-local" value={start} onChange={(e) => setStart(e.target.value)}
              className="w-full bg-white/5 ring-1 ring-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-[var(--accent-purple)]/50" />
            <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Description" rows={3}
              className="w-full bg-white/5 ring-1 ring-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-[var(--accent-purple)]/50 resize-none" />
            <div className="flex justify-end gap-2 pt-1">
              <GhostButton onClick={() => setAdding(false)}>Cancel</GhostButton>
              <PrimaryButton onClick={add} disabled={!title.trim()}>Add</PrimaryButton>
            </div>
          </div>
        ) : (
          <ul className="text-xs text-muted-foreground space-y-2">
            <li>• A clean timeline = sharper AI reports.</li>
            <li>• Mention speaker affiliations for nicer letters.</li>
            <li>• You can convert the timeline → full report from AI Studio.</li>
          </ul>
        )}
      </div>
    </div>
  );
}

/* -------------------- MEDIA -------------------- */
function MediaTab({ clubId, eventId, userId, photos, qc }: {
  clubId: string; eventId: string; userId: string; photos: Photo[]; qc: ReturnType<typeof useQueryClient>;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const upload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const path = `${clubId}/${eventId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("club-photos").upload(path, file, { upsert: false });
      if (upErr) { toast.error(upErr.message); continue; }
      const { data: pub } = supabase.storage.from("club-photos").getPublicUrl(path);
      const { error: insErr } = await supabase.from("photos").insert({
        club_id: clubId, event_id: eventId, url: pub.publicUrl, uploaded_by: userId,
      });
      if (insErr) toast.error(insErr.message);
    }
    setUploading(false);
    toast.success("Photos uploaded");
    qc.invalidateQueries({ queryKey: ["event-photos", eventId] });
  };

  const remove = async (p: Photo) => {
    const { error } = await supabase.from("photos").delete().eq("id", p.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["event-photos", eventId] });
  };

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); upload(e.dataTransfer.files); }}
        className={`glass rounded-2xl p-8 text-center border-2 border-dashed transition cursor-pointer ${
          dragging ? "border-[var(--accent-purple)] bg-[var(--accent-purple)]/5" : "border-white/10"
        }`}
        onClick={() => fileRef.current?.click()}
      >
        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={(e) => upload(e.target.files)} />
        <Upload className="size-6 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm">{uploading ? "Uploading…" : "Drop photos here or click to upload"}</p>
        <p className="text-[11px] text-muted-foreground mt-1">JPG, PNG, WebP — multiple files supported</p>
      </div>

      {photos.length === 0 ? (
        <EmptyHint icon={ImageIcon} text="No event photos yet." />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {photos.map((p) => (
            <motion.div key={p.id} initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-square rounded-xl overflow-hidden bg-white/5 group ring-1 ring-white/5">
              <img src={p.url} alt={p.caption ?? ""} className="w-full h-full object-cover group-hover:scale-105 transition" />
              <button onClick={() => remove(p)}
                className="absolute top-2 right-2 size-7 rounded-full bg-black/60 backdrop-blur-sm text-white opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                <Trash2 className="size-3.5" />
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------- DOCUMENTS -------------------- */
function DocumentsTab({ clubId, docs }: { clubId: string; docs: Doc[] }) {
  return (
    <div className="space-y-3">
      {docs.length === 0 ? (
        <EmptyHint icon={FileText} text="No documents yet. Generate reports, letters, and captions from AI Studio." />
      ) : (
        docs.map((d) => (
          <Link key={d.id} to="/club/$clubId/documents" params={{ clubId }}
            className="block glass rounded-2xl p-4 hover:ring-1 hover:ring-[var(--accent-purple)]/40 transition">
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-[var(--accent-purple)]" />
                  <span className="font-medium truncate">{d.title}</span>
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground bg-white/5 rounded-full px-2 py-0.5">{d.doc_type}</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{d.content.replace(/[#*`>_-]/g, "").slice(0, 200)}</p>
              </div>
              <button onClick={(e) => { e.preventDefault(); exportDOCX(d.title, d.content); }}
                className="text-xs text-muted-foreground hover:text-foreground glass px-2.5 py-1 rounded-lg">
                Export
              </button>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}

/* -------------------- ATTENDANCE -------------------- */
function AttendanceTab({ clubId, eventId, userId, attendees, qc }: {
  clubId: string; eventId: string; userId: string; attendees: Attendee[]; qc: ReturnType<typeof useQueryClient>;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const add = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from("event_attendees").insert({
      event_id: eventId, club_id: clubId, name, email: email || null, added_by: userId,
    });
    if (error) return toast.error(error.message);
    setName(""); setEmail("");
    qc.invalidateQueries({ queryKey: ["attendees", eventId] });
  };

  const toggle = async (a: Attendee) => {
    const { error } = await supabase.from("event_attendees").update({
      attended: !a.attended, checked_in_at: !a.attended ? new Date().toISOString() : null,
    }).eq("id", a.id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["attendees", eventId] });
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("event_attendees").delete().eq("id", id);
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["attendees", eventId] });
  };

  const present = attendees.filter((a) => a.attended).length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 glass rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Attendance</h3>
          <span className="text-xs text-muted-foreground">{present} / {attendees.length} checked in</span>
        </div>
        {attendees.length === 0 ? (
          <EmptyHint icon={Users} text="No attendees yet. Add names to track check-ins." />
        ) : (
          <ul className="divide-y divide-white/5">
            {attendees.map((a) => (
              <li key={a.id} className="flex items-center gap-3 py-3 group">
                <button onClick={() => toggle(a)} className="shrink-0">
                  {a.attended
                    ? <CheckCircle2 className="size-5 text-emerald-400" />
                    : <Circle className="size-5 text-muted-foreground" />}
                </button>
                <div className="size-8 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center text-xs font-semibold">
                  {a.name.slice(0, 1).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{a.name}</div>
                  {a.email && <div className="text-xs text-muted-foreground truncate">{a.email}</div>}
                </div>
                <button onClick={() => remove(a.id)}
                  className="opacity-0 group-hover:opacity-100 transition text-muted-foreground hover:text-red-400">
                  <Trash2 className="size-3.5" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="glass rounded-2xl p-5 h-fit space-y-3">
        <h3 className="font-semibold text-sm">Add attendee</h3>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name"
          className="w-full bg-white/5 ring-1 ring-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-[var(--accent-purple)]/50" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email (optional)"
          className="w-full bg-white/5 ring-1 ring-white/10 rounded-lg px-3 py-2 text-sm outline-none focus:ring-[var(--accent-purple)]/50" />
        <PrimaryButton onClick={add} disabled={!name.trim()} className="w-full justify-center">
          <Plus className="size-3.5" /> Add
        </PrimaryButton>
      </div>
    </div>
  );
}

/* -------------------- INSIGHTS -------------------- */
function InsightsTab({ ev, sessions, attendees, photos, clubId }: {
  ev: Ev | null; sessions: Session[]; attendees: Attendee[]; photos: Photo[]; clubId: string;
}) {
  const [insights, setInsights] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateDocument);

  const run = async () => {
    if (!ev) return;
    setLoading(true);
    try {
      const brief = buildBrief(ev, sessions, attendees, photos.length);
      const res = await generate({ data: { clubId, docType: "quality_insights", brief } });
      setInsights(res.content);
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold flex items-center gap-2"><Bot className="size-4 text-[var(--accent-purple)]" /> AI Event Insights</h3>
          <p className="text-xs text-muted-foreground mt-1">Quality score, strengths, and improvement ideas based on your event data.</p>
        </div>
        <PrimaryButton onClick={run} disabled={loading}>
          {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
          {loading ? "Analyzing…" : insights ? "Regenerate" : "Analyze event"}
        </PrimaryButton>
      </div>
      {insights ? (
        <article className="prose prose-invert prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(insights) }} />
      ) : (
        <EmptyHint icon={Bot} text="Click Analyze to get an AI-powered review of this event." />
      )}
    </div>
  );
}

/* -------------------- AI STUDIO PANEL -------------------- */
const AI_ACTIONS = [
  { id: "event_report", label: "Event Report", icon: ScrollText, desc: "Full professional post-event report" },
  { id: "highlights", label: "Highlights", icon: ListChecks, desc: "Bullet-point highlights for recaps" },
  { id: "summary", label: "Summary", icon: FileText, desc: "Concise executive summary" },
  { id: "social_linkedin", label: "LinkedIn post", icon: Linkedin, desc: "Professional social copy" },
  { id: "social_instagram", label: "Instagram caption", icon: Instagram, desc: "Vibrant social caption with hashtags" },
  { id: "appreciation", label: "Appreciation letter", icon: Award, desc: "Thank-you note for guests/speakers" },
] as const;

function AIStudioPanel({ ev, sessions, attendees, photos, userId, onClose, onSaved }: {
  ev: Ev; sessions: Session[]; attendees: Attendee[]; photos: Photo[]; userId: string;
  onClose: () => void; onSaved: () => void;
}) {
  const [action, setAction] = useState<(typeof AI_ACTIONS)[number]["id"]>("event_report");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const generate = useServerFn(generateDocument);

  const run = async () => {
    setLoading(true); setOutput("");
    try {
      const brief = buildBrief(ev, sessions, attendees, photos.length);
      const res = await generate({ data: { clubId: ev.club_id, docType: action, brief } });
      setOutput(res.content);
    } catch (e: any) {
      toast.error(e?.message ?? "Generation failed");
    } finally { setLoading(false); }
  };

  const save = async () => {
    if (!output.trim()) return;
    const meta = AI_ACTIONS.find((a) => a.id === action)!;
    const { error } = await supabase.from("documents").insert({
      club_id: ev.club_id, event_id: ev.id, created_by: userId,
      title: `${ev.title} — ${meta.label}`, content: output, doc_type: action,
    });
    if (error) return toast.error(error.message);
    toast.success("Saved to documents");
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-stretch justify-end" onClick={onClose}>
      <motion.div
        initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-background/95 backdrop-blur-xl border-l border-white/10 flex flex-col"
      >
        <header className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center">
              <Wand2 className="size-4" />
            </div>
            <div>
              <div className="font-semibold text-sm">AI Studio</div>
              <div className="text-[11px] text-muted-foreground">Auto-fed with event timeline, attendance & media</div>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X className="size-4" /></button>
        </header>

        <div className="p-5 grid grid-cols-2 gap-2 border-b border-white/10">
          {AI_ACTIONS.map((a) => (
            <button key={a.id} onClick={() => setAction(a.id)}
              className={`text-left p-3 rounded-xl ring-1 transition ${
                action === a.id ? "ring-[var(--accent-purple)]/60 bg-[var(--accent-purple)]/10" : "ring-white/10 hover:ring-white/20 bg-white/5"
              }`}>
              <div className="flex items-center gap-2 text-sm font-medium"><a.icon className="size-3.5" /> {a.label}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{a.desc}</div>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {output ? (
            <article className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />
          ) : (
            <div className="text-center text-sm text-muted-foreground py-16">
              <Sparkles className="size-6 mx-auto mb-2 opacity-70" />
              Pick an action and hit Generate. The AI uses your event details, schedule, speakers, and attendance.
            </div>
          )}
        </div>

        <footer className="border-t border-white/10 p-4 flex items-center justify-between gap-2">
          <GhostButton onClick={onClose}>Close</GhostButton>
          <div className="flex items-center gap-2">
            {output && <GhostButton onClick={save}>Save to documents</GhostButton>}
            <PrimaryButton onClick={run} disabled={loading}>
              {loading ? <Loader2 className="size-3.5 animate-spin" /> : <Sparkles className="size-3.5" />}
              {loading ? "Generating…" : output ? "Regenerate" : "Generate"}
            </PrimaryButton>
          </div>
        </footer>
      </motion.div>
    </div>
  );
}

function buildBrief(ev: Ev, sessions: Session[], attendees: Attendee[], photoCount: number) {
  const date = ev.event_date ? new Date(ev.event_date).toLocaleString() : "TBD";
  const present = attendees.filter((a) => a.attended).length;
  const lines: string[] = [
    `Event: ${ev.title}`,
    `Date: ${date}`,
    `Location: ${ev.location ?? "—"}`,
    `Status: ${ev.status}`,
    `Description: ${ev.description ?? "—"}`,
    `Attendance: ${present} present out of ${attendees.length} registered`,
    `Photos captured: ${photoCount}`,
    ``,
    `Schedule / Sessions:`,
  ];
  if (sessions.length === 0) lines.push("- (no sessions logged)");
  else for (const s of sessions) {
    const t = s.start_time ? new Date(s.start_time).toLocaleString() : "TBD";
    lines.push(`- [${t}] ${s.title}${s.speaker ? ` — Speaker: ${s.speaker}` : ""}${s.description ? ` — ${s.description}` : ""}`);
  }
  return lines.join("\n");
}

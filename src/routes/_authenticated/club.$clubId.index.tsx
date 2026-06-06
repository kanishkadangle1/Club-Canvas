import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import {
  Area, AreaChart, Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
  CartesianGrid, RadialBar, RadialBarChart, PolarAngleAxis,
} from "recharts";
import {
  Calendar, FileText, Image as ImageIcon, Users, Sparkles, Wand2,
  TrendingUp, ArrowUpRight, Activity, Zap, FileSignature, FileBarChart,
  Mail, Plus, Clock, ChevronRight, Bot,
} from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PrimaryButton } from "@/components/AppShell";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authenticated/club/$clubId/")({
  head: () => ({
    meta: [
      { title: "Club Overview — Club Documentor" },
      { name: "description", content: "Club overview with upcoming events, recent documents, team activity, and AI-generated reports for your organization." },
      { property: "og:title", content: "Club Overview — Club Documentor" },
      { property: "og:description", content: "Upcoming events, recent documents, and AI insights for your club." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ClubDashboard,
});

type Club = { id: string; name: string; description: string | null; created_at: string };

function ClubDashboard() {
  const { clubId } = Route.useParams();
  const [aiOpen, setAiOpen] = useState(false);

  const { data: club, isLoading: clubLoading } = useQuery<Club | null>({
    queryKey: ["club", clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("clubs").select("id,name,description,created_at").eq("id", clubId).single();
      if (error) throw error;
      return data as Club;
    },
  });

  const { data: events = [] } = useQuery<any[]>({
    queryKey: ["events", clubId],
    queryFn: async () => {
      const { data } = await supabase.from("events").select("*").eq("club_id", clubId).order("event_date", { ascending: true }).limit(20);
      return data ?? [];
    },
  });

  const { data: documents = [] } = useQuery<any[]>({
    queryKey: ["documents", clubId],
    queryFn: async () => {
      const { data } = await supabase.from("documents").select("*").eq("club_id", clubId).order("created_at", { ascending: false }).limit(10);
      return data ?? [];
    },
  });

  const { data: photos = [] } = useQuery<any[]>({
    queryKey: ["photos", clubId],
    queryFn: async () => {
      const { data } = await supabase.from("photos").select("*").eq("club_id", clubId).order("created_at", { ascending: false }).limit(8);
      return data ?? [];
    },
  });

  const { data: members = [] } = useQuery<any[]>({
    queryKey: ["members", clubId],
    queryFn: async () => {
      const { data } = await supabase
        .from("club_members")
        .select("user_id, role, created_at, profiles(full_name, avatar_url, email)")
        .eq("club_id", clubId);
      return data ?? [];
    },
  });

  const upcoming = events.filter((e) => new Date(e.event_date) >= new Date()).slice(0, 4);
  const aiDocs = documents.filter((d) => d.ai_generated).slice(0, 4);

  const stats = [
    { label: "Events", value: events.length, delta: "+12%", icon: Calendar, glow: "purple" },
    { label: "Documents", value: documents.length, delta: "+8%", icon: FileText, glow: "blue" },
    { label: "Members", value: members.length, delta: "+3", icon: Users, glow: "purple" },
    { label: "AI Generations", value: aiDocs.length || 24, delta: "+42%", icon: Sparkles, glow: "blue" },
  ];

  return (
    <AppShell clubId={clubId} title={club?.name ?? "Workspace"} actions={
      <PrimaryButton onClick={() => setAiOpen(true)}>Ask AI</PrimaryButton>
    }>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
          className="relative overflow-hidden glass-strong gradient-border rounded-3xl p-8"
        >
          <div className="absolute -top-24 -right-24 size-72 rounded-full bg-[var(--accent-purple)] opacity-20 blur-3xl animate-pulse-glow" />
          <div className="absolute -bottom-32 -left-10 size-72 rounded-full bg-[var(--accent-blue)] opacity-20 blur-3xl animate-pulse-glow" />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">Workspace overview</div>
              {clubLoading ? (
                <Skeleton className="h-10 w-72 mt-2" />
              ) : (
                <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-1">
                  Welcome back to <span className="text-gradient">{club?.name}</span>
                </h1>
              )}
              <p className="text-muted-foreground text-sm mt-2 max-w-xl">
                {club?.description || "Your club's intelligent command center — generate reports, manage events, and collaborate beautifully."}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Link to="/club/$clubId/generator" params={{ clubId }} className="glass rounded-xl px-4 py-2.5 text-sm flex items-center gap-2 hover:ring-1 hover:ring-[var(--accent-purple)]/50 transition">
                <Wand2 className="size-4" /> AI Studio
              </Link>
              <Link to="/club/$clubId/documents" params={{ clubId }} className="glass rounded-xl px-4 py-2.5 text-sm flex items-center gap-2 hover:ring-1 hover:ring-[var(--accent-blue)]/50 transition">
                <Plus className="size-4" /> New Doc
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className={`group relative glass rounded-2xl p-5 overflow-hidden hover:ring-1 hover:ring-white/20 transition`}
            >
              <div className={`absolute -right-8 -top-8 size-24 rounded-full ${s.glow === "purple" ? "bg-[var(--accent-purple)]" : "bg-[var(--accent-blue)]"} opacity-10 blur-2xl group-hover:opacity-30 transition`} />
              <div className="flex items-center justify-between">
                <div className="size-9 rounded-lg glass flex items-center justify-center">
                  <s.icon className="size-4 text-foreground/80" />
                </div>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="size-3" /> {s.delta}
                </span>
              </div>
              <div className="mt-4 text-3xl font-semibold tracking-tight">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Bento grid */}
        <div className="grid grid-cols-1 lg:grid-cols-6 auto-rows-[minmax(0,auto)] gap-4">
          {/* Event Analytics chart */}
          <BentoCard className="lg:col-span-4" title="Event Analytics" icon={Activity} subtitle="Engagement over the last 6 months">
            <div className="h-56 mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.24 295)" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="oklch(0.62 0.24 295)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.66 0.20 255)" stopOpacity={0.5} />
                      <stop offset="100%" stopColor="oklch(0.66 0.20 255)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="m" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(20,20,30,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                  <Area type="monotone" dataKey="events" stroke="oklch(0.62 0.24 295)" fill="url(#g1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="attendance" stroke="oklch(0.66 0.20 255)" fill="url(#g2)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </BentoCard>

          {/* Club Performance radial */}
          <BentoCard className="lg:col-span-2" title="Club Performance" icon={Zap} subtitle="Quarterly health score">
            <div className="h-56 -mt-2 relative">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart innerRadius="70%" outerRadius="100%" data={[{ name: "score", value: 86, fill: "url(#gradPerf)" }]} startAngle={90} endAngle={-270}>
                  <defs>
                    <linearGradient id="gradPerf" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="oklch(0.62 0.24 295)" />
                      <stop offset="100%" stopColor="oklch(0.66 0.20 255)" />
                    </linearGradient>
                  </defs>
                  <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                  <RadialBar background={{ fill: "rgba(255,255,255,0.05)" }} dataKey="value" cornerRadius={20} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <div className="text-4xl font-semibold text-gradient">86</div>
                <div className="text-xs text-muted-foreground mt-1">Excellent</div>
              </div>
            </div>
          </BentoCard>

          {/* Upcoming Events */}
          <BentoCard className="lg:col-span-3" title="Upcoming Events" icon={Calendar} action={<Link to="/club/$clubId/generator" params={{ clubId }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">View all <ChevronRight className="size-3" /></Link>}>
            <div className="space-y-2 mt-3">
              {upcoming.length === 0 ? (
                <EmptyRow icon={Calendar} text="No upcoming events scheduled" />
              ) : upcoming.map((e) => (
                <motion.div whileHover={{ x: 4 }} key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] transition">
                  <div className="size-11 rounded-lg bg-gradient-to-br from-[var(--accent-purple)]/30 to-[var(--accent-blue)]/30 flex flex-col items-center justify-center text-[10px] leading-tight">
                    <span className="font-semibold">{new Date(e.event_date).toLocaleString("en", { month: "short" })}</span>
                    <span className="text-base font-bold -mt-0.5">{new Date(e.event_date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{e.title}</div>
                    <div className="text-xs text-muted-foreground truncate">{e.location || "TBD"}</div>
                  </div>
                  <Clock className="size-4 text-muted-foreground" />
                </motion.div>
              ))}
            </div>
          </BentoCard>

          {/* AI Quick Actions */}
          <BentoCard className="lg:col-span-3" title="AI Quick Actions" icon={Sparkles} subtitle="One-click generation">
            <div className="grid grid-cols-2 gap-2 mt-3">
              {[
                { label: "Event Report", icon: FileBarChart, to: "generator" },
                { label: "Invite Letter", icon: Mail, to: "generator" },
                { label: "Proposal", icon: FileSignature, to: "generator" },
                { label: "Summary", icon: Wand2, to: "generator" },
              ].map((a) => (
                <Link key={a.label} to="/club/$clubId/generator" params={{ clubId }}
                  className="group relative overflow-hidden glass rounded-xl p-4 hover:ring-1 hover:ring-[var(--accent-purple)]/40 transition">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-purple)]/0 to-[var(--accent-blue)]/0 group-hover:from-[var(--accent-purple)]/10 group-hover:to-[var(--accent-blue)]/10 transition" />
                  <a.icon className="size-4 text-[var(--accent-purple)]" />
                  <div className="text-sm font-medium mt-3">{a.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Generate with AI</div>
                  <ArrowUpRight className="size-3.5 absolute top-3 right-3 text-muted-foreground group-hover:text-foreground transition" />
                </Link>
              ))}
            </div>
          </BentoCard>

          {/* Recent Documents */}
          <BentoCard className="lg:col-span-3" title="Recent Documents" icon={FileText}>
            <div className="mt-3 divide-y divide-white/5">
              {documents.length === 0 ? (
                <EmptyRow icon={FileText} text="No documents yet" />
              ) : documents.slice(0, 5).map((d) => (
                <div key={d.id} className="flex items-center justify-between py-2.5 group">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="size-8 rounded-lg glass flex items-center justify-center"><FileText className="size-3.5" /></div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">{d.title}</div>
                      <div className="text-[11px] text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                  {d.ai_generated && (
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--accent-purple)]/20 text-[var(--accent-purple)]">AI</span>
                  )}
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Team Activity */}
          <BentoCard className="lg:col-span-3" title="Team Activity" icon={Users}>
            <div className="space-y-3 mt-3">
              {members.length === 0 ? (
                <EmptyRow icon={Users} text="Invite teammates to get started" />
              ) : members.slice(0, 5).map((m: any, i: number) => (
                <div key={m.user_id} className="flex items-center gap-3">
                  <div className="size-9 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center text-xs font-semibold ring-2 ring-background">
                    {(m.profiles?.full_name ?? m.profiles?.email ?? "?").slice(0, 1).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{m.profiles?.full_name ?? m.profiles?.email ?? "Member"}</div>
                    <div className="text-[11px] text-muted-foreground capitalize">{m.role} · joined {new Date(m.created_at).toLocaleDateString()}</div>
                  </div>
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse-glow" style={{ animationDelay: `${i * 0.3}s` }} />
                </div>
              ))}
            </div>
          </BentoCard>

          {/* Recent AI Reports */}
          <BentoCard className="lg:col-span-3" title="AI Generated Reports" icon={Bot} subtitle="Last week">
            <div className="h-44 mt-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aiBarData}>
                  <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="d" stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.4)" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ background: "rgba(20,20,30,0.9)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }} />
                  <defs>
                    <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="oklch(0.66 0.20 255)" />
                      <stop offset="100%" stopColor="oklch(0.62 0.24 295)" />
                    </linearGradient>
                  </defs>
                  <Bar dataKey="count" fill="url(#bg)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </BentoCard>

          {/* Event Gallery Preview */}
          <BentoCard className="lg:col-span-6" title="Event Gallery" icon={ImageIcon}
            action={<Link to="/club/$clubId/gallery" params={{ clubId }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">Open gallery <ChevronRight className="size-3" /></Link>}>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2 mt-3">
              {(photos.length ? photos : Array.from({ length: 8 })).slice(0, 8).map((p: any, i) => (
                <motion.div
                  key={p?.id ?? i}
                  whileHover={{ scale: 1.04, y: -2 }}
                  className="aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-[var(--accent-purple)]/30 to-[var(--accent-blue)]/30 ring-1 ring-white/10 relative group"
                >
                  {p?.url ? (
                    <img src={p.url} alt={p.caption ?? ""} className="size-full object-cover transition group-hover:scale-110" />
                  ) : (
                    <div className="size-full flex items-center justify-center text-muted-foreground"><ImageIcon className="size-5" /></div>
                  )}
                </motion.div>
              ))}
            </div>
          </BentoCard>
        </div>
      </div>

      {/* Floating AI assistant */}
      <motion.button
        onClick={() => setAiOpen((v) => !v)}
        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-40 size-14 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] glow-purple flex items-center justify-center shadow-xl ring-1 ring-white/20 no-print"
      >
        <Sparkles className="size-5 text-white" />
        <span className="absolute inset-0 rounded-full animate-ping bg-[var(--accent-purple)]/30" />
      </motion.button>

      {aiOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }}
          className="fixed bottom-24 right-6 z-40 w-[340px] glass-strong gradient-border rounded-2xl p-5 no-print"
        >
          <div className="flex items-center gap-2 mb-3">
            <Bot className="size-4 text-[var(--accent-purple)]" />
            <div className="text-sm font-semibold">AI Assistant</div>
          </div>
          <p className="text-xs text-muted-foreground">Ask me to draft a report, schedule an event, or summarize last week's activity.</p>
          <Link to="/club/$clubId/generator" params={{ clubId }} onClick={() => setAiOpen(false)}
            className="mt-4 w-full inline-flex items-center justify-center gap-2 bg-[var(--accent-purple)] text-white text-sm font-medium py-2 rounded-lg glow-purple hover:brightness-110">
            <Wand2 className="size-4" /> Open AI Studio
          </Link>
        </motion.div>
      )}
    </AppShell>
  );
}

function BentoCard({
  className = "", title, subtitle, icon: Icon, action, children,
}: {
  className?: string; title: string; subtitle?: string; icon: any; action?: React.ReactNode; children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`glass rounded-2xl p-5 hover:ring-1 hover:ring-white/15 transition ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="size-7 rounded-md glass flex items-center justify-center">
            <Icon className="size-3.5 text-foreground/80" />
          </div>
          <div>
            <div className="text-sm font-semibold">{title}</div>
            {subtitle && <div className="text-[11px] text-muted-foreground">{subtitle}</div>}
          </div>
        </div>
        {action}
      </div>
      {children}
    </motion.div>
  );
}

function EmptyRow({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="text-center py-8 text-muted-foreground text-sm flex flex-col items-center gap-2">
      <Icon className="size-5 opacity-50" />
      {text}
    </div>
  );
}

const chartData = [
  { m: "Jan", events: 4, attendance: 120 },
  { m: "Feb", events: 6, attendance: 180 },
  { m: "Mar", events: 5, attendance: 160 },
  { m: "Apr", events: 8, attendance: 240 },
  { m: "May", events: 7, attendance: 220 },
  { m: "Jun", events: 11, attendance: 320 },
];

const aiBarData = [
  { d: "Mon", count: 3 }, { d: "Tue", count: 5 }, { d: "Wed", count: 2 },
  { d: "Thu", count: 7 }, { d: "Fri", count: 4 }, { d: "Sat", count: 6 }, { d: "Sun", count: 8 },
];

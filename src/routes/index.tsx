import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { motion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles, FileText, Users, Image as ImageIcon, Wand2, ArrowRight,
  Zap, Calendar, MessageSquare, Check, Plus, Minus, Twitter, Github, Linkedin,
  Bot, Layers, Rocket, Star,
} from "lucide-react";

const FAQ_ITEMS = [
  { q: "What is Club Documentor?", a: "An AI-powered documentation workspace built specifically for college clubs — generate reports, manage events, collaborate, and store everything in one place." },
  { q: "Is it really free for clubs?", a: "Yes. The Starter plan is free forever for small clubs. Upgrade to Pro when your team grows or needs unlimited AI generations." },
  { q: "Do you support multiple clubs under one account?", a: "Absolutely. Each user can join or create multiple workspaces with isolated members, documents and events." },
  { q: "What AI models do you use?", a: "We use top-tier large language models tuned with templates for student-organization documents. No setup or API key required." },
  { q: "Can we export documents?", a: "Yes — every document exports to PDF and DOCX with one click, ready to share with faculty or sponsors." },
  { q: "Is our data private?", a: "Your workspace is yours alone. Role-based access controls and row-level security keep every club's data isolated." },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Club Documentor — AI Workspace for Clubs" },
      { name: "description", content: "AI-powered workspace where college clubs generate reports, run events, collaborate in realtime, and document everything beautifully." },
      { property: "og:title", content: "Club Documentor — AI Workspace for Clubs" },
      { property: "og:description", content: "AI-powered workspace where college clubs generate reports, run events, and document everything beautifully." },
      { property: "og:url", content: "https://guild-docs-ai-club-documentor.lovable.app/" },
    ],
    links: [{ rel: "canonical", href: "https://guild-docs-ai-club-documentor.lovable.app/" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: FAQ_ITEMS.map((it) => ({
            "@type": "Question",
            name: it.q,
            acceptedAnswer: { "@type": "Answer", text: it.a },
          })),
        }),
      },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[color-mix(in_oklab,var(--accent-purple)_30%,transparent)] overflow-x-hidden">
      <AnimatedNav />
      <Hero />
      <LogoStrip />
      <Features />
      <ProductShowcase />
      <Testimonials />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />
    </div>
  );
}

/* ---------- Animated Nav ---------- */
function AnimatedNav() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <motion.nav
      initial={{ y: -30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "bg-background/70 backdrop-blur-xl border-b border-white/5" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Logo />
          <div className="hidden md:flex gap-7 text-sm font-medium text-muted-foreground">
            {["Features", "Product", "Pricing", "FAQ"].map((l) => (
              <a key={l} href={`#${l.toLowerCase()}`} className="hover:text-foreground transition-colors relative group">
                {l}
                <span className="absolute -bottom-1 left-0 h-px w-0 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)] group-hover:w-full transition-all duration-300" />
              </a>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/login" className="text-sm font-medium px-4 py-2 text-muted-foreground hover:text-foreground transition-colors">Log in</Link>
          <Link to="/login" search={{ mode: "signup" }} className="group relative text-sm font-medium px-4 py-2 rounded-lg overflow-hidden">
            <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)] opacity-90 group-hover:opacity-100 transition-opacity" />
            <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent-blue)] to-[var(--accent-purple)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative text-white flex items-center gap-1.5">Get Started <ArrowRight className="size-3.5" /></span>
          </Link>
        </div>
      </div>
    </motion.nav>
  );
}

/* ---------- Animated background ---------- */
function FuturisticBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Grid */}
      <div
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage:
            "linear-gradient(color-mix(in oklab, white 10%, transparent) 1px, transparent 1px), linear-gradient(90deg, color-mix(in oklab, white 10%, transparent) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 80%)",
        }}
      />
      {/* Orbs */}
      <motion.div
        animate={{ x: [0, 60, 0], y: [0, 30, 0] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-32 -left-32 size-[480px] rounded-full blur-[140px] opacity-60"
        style={{ background: "var(--accent-purple)" }}
      />
      <motion.div
        animate={{ x: [0, -50, 0], y: [0, 40, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 -right-32 size-[520px] rounded-full blur-[160px] opacity-50"
        style={{ background: "var(--accent-blue)" }}
      />
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/3 size-[400px] rounded-full blur-[120px] opacity-30"
        style={{ background: "var(--accent-purple)" }}
      />
    </div>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <section ref={ref} className="relative pt-40 pb-32 px-6">
      <FuturisticBackground />
      <motion.div style={{ y, opacity }} className="relative max-w-7xl mx-auto flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full glass mb-8"
        >
          <span className="size-1.5 rounded-full bg-[var(--accent-purple)] animate-pulse" />
          <span className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground">
            AI Documentation Workspace · v1.0
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-semibold tracking-tight leading-[1.02] mb-8 max-w-5xl"
        >
          The AI workspace for{" "}
          <span className="relative inline-block">
            <span className="text-gradient">clubs & organizations</span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 1.2, delay: 0.8 }}
              className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[var(--accent-blue)] to-transparent origin-left"
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="text-lg md:text-xl text-muted-foreground max-w-[58ch] mb-10 leading-relaxed"
        >
          Generate reports, draft permissions, plan events and capture every memory. One beautiful workspace
          where every campus club ships faster — powered by AI.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-3 mb-20"
        >
          <Link
            to="/login"
            search={{ mode: "signup" }}
            className="group relative inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-sm overflow-hidden glow-purple"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)]" />
            <span className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-[var(--accent-blue)] via-[var(--accent-purple)] to-[var(--accent-blue)] bg-[length:200%_100%] transition-opacity duration-500"
                  style={{ animation: "shimmer 2s linear infinite" }} />
            <span className="relative text-white flex items-center gap-2">
              <Sparkles className="size-4" /> Start your workspace
            </span>
          </Link>
          <a href="#product" className="glass px-6 py-3 rounded-xl text-sm font-medium hover:bg-accent transition-all hover:scale-[1.02]">
            See it in action
          </a>
        </motion.div>

        {/* Mockup */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
          className="relative w-full max-w-6xl mx-auto"
        >
          <div className="absolute -inset-4 bg-gradient-to-tr from-[var(--accent-purple)] via-transparent to-[var(--accent-blue)] opacity-30 blur-3xl rounded-3xl" />
          <div className="relative glass-strong rounded-2xl p-2 shadow-2xl gradient-border">
            <div className="bg-background/95 rounded-xl border border-white/5 overflow-hidden">
              {/* Window chrome */}
              <div className="h-10 border-b border-white/5 bg-card/40 flex items-center px-4 gap-2">
                <div className="size-2.5 rounded-full bg-red-500/60" />
                <div className="size-2.5 rounded-full bg-yellow-500/60" />
                <div className="size-2.5 rounded-full bg-green-500/60" />
                <div className="ml-4 text-[11px] font-medium text-muted-foreground tracking-wide">clubdocumentor.app / robotics-club</div>
              </div>
              <div className="grid grid-cols-12 h-[480px]">
                {/* Sidebar */}
                <div className="col-span-3 border-r border-white/5 p-4 space-y-3 hidden md:block">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">Workspace</div>
                  {["Dashboard", "Documents", "Events", "Gallery", "Team"].map((i, idx) => (
                    <div key={i} className={`text-xs font-medium px-2.5 py-2 rounded-md flex items-center gap-2 ${idx === 1 ? "bg-[color-mix(in_oklab,var(--accent-purple)_15%,transparent)] text-foreground" : "text-muted-foreground"}`}>
                      <div className="size-1.5 rounded-full bg-current opacity-60" /> {i}
                    </div>
                  ))}
                </div>
                {/* Editor */}
                <div className="col-span-12 md:col-span-6 p-6 border-r border-white/5 text-left">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Document · Auto-saving</div>
                  <div className="text-lg font-semibold mb-4">Annual Robotics Fest — Event Report</div>
                  <div className="space-y-2.5">
                    {[100, 80, 95, 70, 88, 92, 60].map((w, i) => (
                      <motion.div
                        key={i}
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: `${w}%`, opacity: 1 }}
                        transition={{ duration: 0.6, delay: 0.9 + i * 0.08 }}
                        className="h-2.5 rounded bg-muted/60"
                      />
                    ))}
                  </div>
                </div>
                {/* AI panel */}
                <div className="col-span-12 md:col-span-3 p-4 bg-card/30">
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
                    <Bot className="size-3 text-[var(--accent-purple)]" /> AI Assistant
                  </div>
                  <div className="space-y-2">
                    {[
                      { label: "Improve tone", c: "var(--accent-purple)" },
                      { label: "Summarize event", c: "var(--accent-blue)" },
                      { label: "Generate report", c: "var(--accent-purple)" },
                    ].map((x) => (
                      <div key={x.label} className="glass rounded-md p-2.5 text-xs flex items-center gap-2">
                        <Sparkles className="size-3" style={{ color: x.c }} />
                        {x.label}
                      </div>
                    ))}
                  </div>
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 1.6 }}
                    className="mt-4 glass-strong rounded-lg p-3 text-[11px] text-muted-foreground"
                  >
                    <div className="flex items-center gap-1.5 mb-1.5 text-foreground font-medium">
                      <span className="size-1.5 rounded-full bg-[var(--accent-purple)] animate-pulse" /> Writing...
                    </div>
                    Refining your event recap for a formal tone.
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
      <style>{`@keyframes shimmer { 0% { background-position: 0% 0; } 100% { background-position: 200% 0; } }`}</style>
    </section>
  );
}

/* ---------- Logo strip ---------- */
function LogoStrip() {
  const logos = ["MIT Robotics", "Stanford ACM", "IIT Cultural", "Berkeley AI", "Harvard Debate", "NUS Tech"];
  return (
    <section className="py-12 px-6 border-y border-white/5 bg-card/20">
      <div className="max-w-7xl mx-auto">
        <p className="text-center text-[11px] uppercase tracking-widest text-muted-foreground mb-8">
          Trusted by 200+ campus organizations worldwide
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4">
          {logos.map((l) => (
            <div key={l} className="text-sm font-semibold text-muted-foreground/60 hover:text-foreground transition-colors">
              {l}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Features ---------- */
function Features() {
  const features = [
    { icon: Wand2, title: "AI Document Generation", body: "Generate permission letters, proposals and reports from a short brief. Every template tuned for clubs.", c: "var(--accent-purple)" },
    { icon: Zap, title: "Event Report Automation", body: "Convert timelines, attendance, and photos into a polished after-event report in seconds.", c: "var(--accent-blue)" },
    { icon: Layers, title: "Club Workspace Management", body: "Each club gets its own workspace with members, roles, events and a private document library.", c: "var(--accent-purple)" },
    { icon: MessageSquare, title: "Realtime Collaboration", body: "Co-edit documents with live presence, version history, comments and AI assist — together.", c: "var(--accent-blue)" },
    { icon: ImageIcon, title: "Event Photo Documentation", body: "Drag-and-drop galleries that auto-link to event reports for a beautiful visual history.", c: "var(--accent-purple)" },
    { icon: Calendar, title: "Event Lifecycle", body: "Plan, run, and recap events end-to-end. Track RSVPs, assignments, and post-event docs.", c: "var(--accent-blue)" },
  ];
  return (
    <section id="features" className="relative py-32 px-6">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <div className="text-[11px] uppercase tracking-widest text-[var(--accent-purple)] font-semibold mb-3">Features</div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Everything your club needs, in one place.</h2>
          <p className="text-muted-foreground text-lg">From the first proposal to the final recap — Club Documentor handles the paperwork so leaders can lead.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.07 }}
              whileHover={{ y: -6 }}
              className="group relative p-7 rounded-2xl glass overflow-hidden"
            >
              <div
                className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `linear-gradient(135deg, ${f.c}, transparent 60%)`, padding: 1, WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }}
              />
              <div
                className="size-11 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                style={{ background: `color-mix(in oklab, ${f.c} 15%, transparent)`, boxShadow: `0 0 30px -10px ${f.c}` }}
              >
                <f.icon className="size-5" style={{ color: f.c }} />
              </div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.body}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Product showcase ---------- */
function ProductShowcase() {
  const items = [
    { tag: "AI Studio", title: "Write less. Ship more docs.", body: "One brief. Multiple formats. Switch between formal, persuasive, or technical voices — instantly.", icon: Bot },
    { tag: "Events", title: "From idea to recap, beautifully.", body: "Plan timelines, attach photos, assign team members and auto-generate after-event reports.", icon: Calendar },
    { tag: "Collaboration", title: "Your whole team in the same doc.", body: "Live cursors, presence pills, comments, and AI suggestions that everyone can see.", icon: Users },
  ];
  return (
    <section id="product" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto space-y-32">
        {items.map((it, i) => (
          <motion.div
            key={it.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className={`grid md:grid-cols-2 gap-12 items-center ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}
          >
            <div>
              <div className="text-[11px] uppercase tracking-widest text-[var(--accent-blue)] font-semibold mb-3">{it.tag}</div>
              <h3 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">{it.title}</h3>
              <p className="text-muted-foreground text-lg leading-relaxed mb-6">{it.body}</p>
              <ul className="space-y-2.5">
                {["Tuned for college organizations", "PDF and DOCX exports", "Role-based access"].map((x) => (
                  <li key={x} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="size-4 text-[var(--accent-purple)]" /> {x}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-tr from-[var(--accent-purple)]/30 to-[var(--accent-blue)]/30 blur-3xl rounded-3xl" />
              <motion.div
                whileHover={{ y: -6, rotate: -0.5 }}
                className="relative glass-strong gradient-border rounded-2xl p-6 aspect-[4/3] flex items-center justify-center overflow-hidden"
              >
                <div className="absolute inset-0 bg-mesh opacity-50" />
                <div className="relative flex flex-col items-center gap-4">
                  <div className="size-20 rounded-2xl bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center glow-purple animate-float">
                    <it.icon className="size-10 text-white" />
                  </div>
                  <div className="space-y-1.5 w-2/3">
                    <div className="h-2 bg-white/10 rounded" />
                    <div className="h-2 bg-white/10 rounded w-4/5" />
                    <div className="h-2 bg-white/10 rounded w-3/5" />
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Testimonials ---------- */
function Testimonials() {
  const tt = [
    { name: "Aanya Sharma", role: "President · IIT Robotics Club", body: "We cut report-writing time by 80%. Permissions, recaps, sponsor decks — all generated in minutes.", color: "var(--accent-purple)" },
    { name: "Marcus Chen", role: "Lead · Stanford ACM", body: "It feels like Notion and Linear had an AI baby for student orgs. Our team finally enjoys documentation.", color: "var(--accent-blue)" },
    { name: "Lina Okafor", role: "Coordinator · MIT Cultural", body: "The auto-generated event galleries are stunning. Our alumni love seeing the year unfold visually.", color: "var(--accent-purple)" },
  ];
  return (
    <section className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="text-[11px] uppercase tracking-widest text-[var(--accent-blue)] font-semibold mb-3">Loved by leaders</div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Built for the next generation of campus leaders.</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-5">
          {tt.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6 }}
              className="glass rounded-2xl p-7 relative overflow-hidden"
            >
              <div className="flex gap-0.5 mb-4">
                {[...Array(5)].map((_, k) => <Star key={k} className="size-3.5 fill-[var(--accent-purple)] text-[var(--accent-purple)]" />)}
              </div>
              <p className="text-sm leading-relaxed text-foreground/90 mb-6">"{t.body}"</p>
              <div className="flex items-center gap-3">
                <div className="size-9 rounded-full flex items-center justify-center text-xs font-semibold text-white"
                     style={{ background: `linear-gradient(135deg, ${t.color}, var(--accent-blue))` }}>
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Pricing ---------- */
function Pricing() {
  const plans = [
    { name: "Starter", price: "Free", desc: "For new clubs getting started.", features: ["1 workspace", "Up to 10 members", "20 AI generations / month", "PDF export"], cta: "Start free", highlight: false },
    { name: "Club Pro", price: "$12", per: "/mo", desc: "For active organizations.", features: ["Unlimited members", "Unlimited AI generations", "PDF + DOCX export", "Realtime collaboration", "Priority support"], cta: "Upgrade to Pro", highlight: true },
    { name: "Campus", price: "Custom", desc: "Multi-club deployments for universities.", features: ["Unlimited workspaces", "SSO + admin controls", "Dedicated success manager", "Custom AI templates"], cta: "Talk to us", highlight: false },
  ];
  return (
    <section id="pricing" className="py-32 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="text-[11px] uppercase tracking-widest text-[var(--accent-purple)] font-semibold mb-3">Pricing</div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Free for clubs. Powerful for everyone.</h2>
          <p className="text-muted-foreground text-lg">Start free, upgrade when your club grows.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -8 }}
              className={`relative rounded-2xl p-8 ${p.highlight ? "gradient-border glass-strong glow-purple" : "glass"}`}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-[10px] uppercase tracking-widest font-semibold rounded-full bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)] text-white">
                  Most popular
                </div>
              )}
              <div className="text-sm font-medium text-muted-foreground mb-2">{p.name}</div>
              <div className="flex items-baseline gap-1 mb-3">
                <span className="text-4xl font-semibold tracking-tight">{p.price}</span>
                {p.per && <span className="text-sm text-muted-foreground">{p.per}</span>}
              </div>
              <p className="text-sm text-muted-foreground mb-6">{p.desc}</p>
              <ul className="space-y-2.5 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="size-4 mt-0.5 text-[var(--accent-blue)] shrink-0" />
                    <span className="text-foreground/90">{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                to="/login"
                search={{ mode: "signup" }}
                className={`block text-center py-2.5 rounded-lg text-sm font-medium transition-all ${
                  p.highlight
                    ? "bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)] text-white hover:brightness-110"
                    : "glass hover:bg-accent"
                }`}
              >
                {p.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- FAQ ---------- */
function FAQ() {
  const items = [
    { q: "What is Club Documentor?", a: "An AI-powered documentation workspace built specifically for college clubs — generate reports, manage events, collaborate, and store everything in one place." },
    { q: "Is it really free for clubs?", a: "Yes. The Starter plan is free forever for small clubs. Upgrade to Pro when your team grows or needs unlimited AI generations." },
    { q: "Do you support multiple clubs under one account?", a: "Absolutely. Each user can join or create multiple workspaces with isolated members, documents and events." },
    { q: "What AI models do you use?", a: "We use top-tier large language models tuned with templates for student-organization documents. No setup or API key required." },
    { q: "Can we export documents?", a: "Yes — every document exports to PDF and DOCX with one click, ready to share with faculty or sponsors." },
    { q: "Is our data private?", a: "Your workspace is yours alone. Role-based access controls and row-level security keep every club's data isolated." },
  ];
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="py-32 px-6">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <div className="text-[11px] uppercase tracking-widest text-[var(--accent-blue)] font-semibold mb-3">FAQ</div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-tight">Questions, answered.</h2>
        </motion.div>
        <div className="space-y-3">
          {items.map((it, i) => (
            <motion.div
              key={it.q}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="glass rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-white/5 transition-colors"
              >
                <span className="text-sm font-medium pr-4">{it.q}</span>
                {open === i ? <Minus className="size-4 text-[var(--accent-purple)] shrink-0" /> : <Plus className="size-4 text-muted-foreground shrink-0" />}
              </button>
              <motion.div
                initial={false}
                animate={{ height: open === i ? "auto" : 0, opacity: open === i ? 1 : 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-5 text-sm text-muted-foreground leading-relaxed">{it.a}</div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------- Final CTA ---------- */
function FinalCTA() {
  return (
    <section className="py-32 px-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7 }}
        className="relative max-w-5xl mx-auto rounded-3xl overflow-hidden gradient-border glass-strong p-14 text-center"
      >
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 size-[400px] rounded-full blur-[120px] bg-[var(--accent-purple)]/40" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass mb-6">
            <Rocket className="size-3.5 text-[var(--accent-purple)]" />
            <span className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">Ready when you are</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight mb-5 max-w-3xl mx-auto">
            Document smarter. <span className="text-gradient">Lead bolder.</span>
          </h2>
          <p className="text-muted-foreground text-lg mb-9 max-w-xl mx-auto">
            Spin up your club's AI workspace in under a minute. No credit card required.
          </p>
          <Link
            to="/login"
            search={{ mode: "signup" }}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl text-sm font-medium text-white bg-gradient-to-r from-[var(--accent-purple)] to-[var(--accent-blue)] glow-purple hover:brightness-110 transition-all"
          >
            <Sparkles className="size-4" /> Create your workspace
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  return (
    <footer className="py-16 px-6 border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <Logo />
            <p className="text-sm text-muted-foreground mt-3 max-w-[40ch] leading-relaxed">
              The AI documentation workspace for clubs and organizations. Simplifying campus logistics for the next generation of leaders.
            </p>
            <div className="flex gap-2 mt-5">
              {[Twitter, Github, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="size-9 rounded-lg glass flex items-center justify-center hover:bg-accent hover:text-foreground transition-colors text-muted-foreground">
                  <Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>
          {[
            { title: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
            { title: "Company", links: ["About", "Blog", "Contact", "Privacy"] },
          ].map((col) => (
            <div key={col.title}>
              <div className="text-xs font-semibold uppercase tracking-widest text-foreground mb-4">{col.title}</div>
              <ul className="space-y-2.5">
                {col.links.map((l) => (
                  <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-8 border-t border-white/5">
          <div className="text-[11px] text-muted-foreground">© 2026 Club Documentor. All rights reserved.</div>
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
            <FileText className="size-3" /> Crafted for campus leaders worldwide
          </div>
        </div>
      </div>
    </footer>
  );
}

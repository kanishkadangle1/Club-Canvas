import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/Logo";
import { Sparkles, FileText, Users, Image as ImageIcon, ShieldCheck, Wand2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Club Documentor — The intelligent engine for student organizations" },
      { name: "description", content: "Generate permission letters, sponsorship proposals, and event recaps in seconds. One central workspace for every club activity." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background bg-mesh text-foreground selection:bg-[color-mix(in_oklab,var(--accent-purple)_30%,transparent)]">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-background/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Logo />
            <div className="hidden md:flex gap-6 text-sm font-medium text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Solutions</a>
              <a href="#templates" className="hover:text-foreground transition-colors">Templates</a>
              <a href="#gallery" className="hover:text-foreground transition-colors">Showcase</a>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm font-medium px-4 py-2 text-muted-foreground hover:text-foreground">Log in</Link>
            <Link to="/login" search={{ mode: "signup" }} className="text-sm font-medium bg-foreground text-background px-4 py-2 rounded-lg hover:opacity-90">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-44 pb-24 px-6">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[color-mix(in_oklab,var(--accent-purple)_15%,transparent)] border border-[color-mix(in_oklab,var(--accent-purple)_30%,transparent)] mb-8">
            <span className="size-1.5 rounded-full bg-[var(--accent-purple)] animate-pulse" />
            <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--accent-purple)]">v1.0 Workspace</span>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-balance leading-[1.05] mb-8 max-w-4xl">
            The intelligent engine for{" "}
            <span className="text-gradient">student organizations</span>
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-[56ch] text-pretty mb-10">
            Generate permission letters, sponsorship proposals, and event recaps in seconds. One central workspace for every club activity.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 mb-20">
            <Link to="/login" search={{ mode: "signup" }} className="inline-flex items-center gap-2 bg-[var(--accent-purple)] text-white font-medium text-sm py-2.5 px-5 rounded-lg ring-1 ring-[color-mix(in_oklab,var(--accent-purple)_50%,transparent)] glow-purple hover:brightness-110 transition">
              <Sparkles className="size-4" />
              Create Your Workspace
            </Link>
            <a href="#features" className="glass text-foreground font-medium text-sm py-2.5 px-5 rounded-lg hover:bg-accent transition">
              Explore Features
            </a>
          </div>

          {/* Hero mockup */}
          <div className="relative w-full max-w-5xl mx-auto">
            <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-[color-mix(in_oklab,var(--accent-purple)_25%,transparent)] blur-[120px] rounded-full" />
            <div className="relative glass-strong rounded-3xl p-2 shadow-2xl overflow-hidden">
              <div className="bg-background rounded-2xl border border-white/5 overflow-hidden">
                <div className="h-10 border-b border-white/5 bg-card/50 flex items-center px-4 gap-2">
                  <div className="size-2.5 rounded-full bg-muted" />
                  <div className="size-2.5 rounded-full bg-muted" />
                  <div className="size-2.5 rounded-full bg-muted" />
                  <div className="ml-4 text-[11px] font-medium text-muted-foreground uppercase tracking-widest">AI Composer — Sponsorship Proposal</div>
                </div>
                <div className="p-8 flex gap-8 h-[460px]">
                  <div className="w-60 shrink-0 flex flex-col gap-4 text-left">
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Document Type</div>
                    <div className="glass rounded-md p-3 text-xs font-medium">Sponsorship Proposal</div>
                    <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Brief</div>
                    <div className="glass rounded-md p-3 h-28 text-xs text-muted-foreground">Request $5,000 from local tech sponsors for our Annual Robotics Fest...</div>
                    <button className="mt-auto w-full bg-[color-mix(in_oklab,var(--accent-blue)_15%,transparent)] text-[var(--accent-blue)] py-2 rounded-md text-xs font-semibold ring-1 ring-[color-mix(in_oklab,var(--accent-blue)_30%,transparent)]">
                      Generate Content
                    </button>
                  </div>
                  <div className="flex-1 glass rounded-lg p-6 relative text-left">
                    <div className="space-y-3">
                      <div className="h-3 w-1/3 bg-muted rounded" />
                      <div className="h-3 w-1/4 bg-muted/60 rounded" />
                      <div className="h-px w-full bg-white/5 my-5" />
                      <div className="h-2.5 w-full bg-muted/60 rounded" />
                      <div className="h-2.5 w-full bg-muted/60 rounded" />
                      <div className="h-2.5 w-5/6 bg-muted/60 rounded" />
                      <div className="h-2.5 w-full bg-muted/60 rounded" />
                      <div className="h-2.5 w-2/3 bg-muted/60 rounded" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent flex items-end justify-center pb-10">
                      <div className="glass-strong px-4 py-2.5 rounded-xl flex items-center gap-3 shadow-xl">
                        <span className="size-3 bg-[var(--accent-purple)] rounded-full animate-pulse" />
                        <span className="text-xs font-medium">Refining for professional tone…</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: FileText, color: "var(--accent-purple)", title: "Smart Templates", body: "From faculty permissions to sponsorship pitch decks, battle-tested club frameworks." },
              { icon: Wand2, color: "var(--accent-blue)", title: "AI Generation", body: "Convert event timelines into professional reports instantly with our semantic AI." },
              { icon: Users, color: "var(--foreground)", title: "Multi-Tenant Hub", body: "Manage multiple college clubs under one identity with isolated workspaces and roles." },
            ].map((f) => (
              <div key={f.title} className="group p-8 rounded-2xl glass hover:ring-1 hover:ring-[color-mix(in_oklab,var(--accent-purple)_40%,transparent)] transition-all">
                <div className="size-10 rounded-lg flex items-center justify-center mb-6" style={{ background: `color-mix(in oklab, ${f.color} 12%, transparent)` }}>
                  <f.icon className="size-5" style={{ color: f.color }} />
                </div>
                <h3 className="text-lg font-medium mb-3">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Templates / AI suite */}
      <section id="templates" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-12">
            <h2 className="text-3xl font-medium tracking-tight mb-3">A full AI suite for every club deliverable</h2>
            <p className="text-sm text-muted-foreground max-w-[60ch]">Built on professional templates. Fully editable. Export to PDF in one click.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { t: "Event Reports", d: "Turn raw timelines into polished after-event reports." },
              { t: "Invitation Letters", d: "Formal invitations for guest speakers and judges." },
              { t: "Permission Letters", d: "Faculty and admin permissions, ready to send." },
              { t: "Sponsorship Proposals", d: "Tiered pitch decks tuned for local sponsors." },
            ].map((c) => (
              <div key={c.t} className="glass rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="size-4 text-[var(--accent-blue)]" />
                  <span className="text-[10px] uppercase tracking-widest text-muted-foreground">Template</span>
                </div>
                <div className="font-medium mb-2">{c.t}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-medium tracking-tight mb-3">Visual History</h2>
              <p className="text-sm text-muted-foreground max-w-[48ch]">Automated galleries that link event photos directly to their post-event summaries.</p>
            </div>
            <Link to="/login" search={{ mode: "signup" }} className="text-sm font-medium text-muted-foreground hover:text-[var(--accent-blue)] transition-colors inline-flex items-center gap-1">
              Start your gallery <ArrowRight className="size-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { t: "Winter Hackathon", n: 12 },
              { t: "Robotics Workshop", n: 8 },
              { t: "Spring Mixer", n: 3 },
              { t: "Annual Symposium", n: 22 },
            ].map((g) => (
              <div key={g.t} className="group relative overflow-hidden rounded-xl aspect-square glass">
                <div className="absolute inset-0 bg-gradient-to-br from-[color-mix(in_oklab,var(--accent-purple)_20%,transparent)] to-[color-mix(in_oklab,var(--accent-blue)_15%,transparent)] group-hover:scale-105 transition-transform duration-500 flex items-center justify-center">
                  <ImageIcon className="size-10 text-white/20" />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-background/85 via-transparent to-transparent p-4 flex flex-col justify-end">
                  <p className="text-xs font-semibold">{g.t}</p>
                  <p className="text-[10px] text-muted-foreground">{g.n} documents generated</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center glass-strong rounded-3xl p-12 gradient-border">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight mb-4">Document smarter. Lead bolder.</h2>
          <p className="text-muted-foreground mb-8">Spin up your club&apos;s AI workspace in under a minute.</p>
          <Link to="/login" search={{ mode: "signup" }} className="inline-flex items-center gap-2 bg-[var(--accent-purple)] text-white font-medium py-3 px-6 rounded-lg glow-purple hover:brightness-110 transition">
            <Sparkles className="size-4" /> Create your workspace
          </Link>
        </div>
      </section>

      <footer className="py-12 border-t border-white/5 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <Logo />
            <p className="text-sm text-muted-foreground mt-2 max-w-[40ch]">Simplifying organization logistics for the next generation of campus leaders.</p>
          </div>
          <div className="text-[11px] text-muted-foreground">&copy; 2026 Club Documentor.</div>
        </div>
      </footer>
    </div>
  );
}

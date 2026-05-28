import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/hooks/useAuth";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Loader2, Sparkles } from "lucide-react";

const search = z.object({
  mode: z.enum(["signin", "signup"]).optional(),
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: search,
  head: () => ({ meta: [{ title: "Sign in — Club Documentor" }] }),
  component: LoginPage,
});

function LoginPage() {
  const { mode: initialMode, redirect } = Route.useSearch();
  const [mode, setMode] = useState<"signin" | "signup">(initialMode ?? "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) navigate({ to: redirect ?? "/dashboard", replace: true });
  }, [user, loading, navigate, redirect]);

  const handle = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
            data: { full_name: name },
          },
        });
        if (error) throw error;
        toast.success("Welcome to Club Documentor!");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err: any) {
      toast.error(err.message ?? "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setBusy(true);
    try {
      const result: any = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin + "/dashboard" });
      if (result?.error) {
        const err = result.error;
        toast.error(typeof err === "string" ? err : (err?.message ?? "Sign-in failed"));
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-mesh flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center"><Logo /></div>
        <div className="glass-strong rounded-2xl p-8 gradient-border">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "signup" ? "Create your workspace" : "Welcome back"}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {mode === "signup" ? "Spin up your club's AI workspace." : "Sign in to your club workspace."}
            </p>
          </div>

          <button
            onClick={google}
            disabled={busy}
            className="w-full flex items-center justify-center gap-2 bg-card hover:bg-accent text-foreground border border-border rounded-lg py-2.5 text-sm font-medium transition disabled:opacity-50"
          >
            <svg className="size-4" viewBox="0 0 24 24"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 16 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/><path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.2c-2 1.4-4.5 2.4-7.3 2.4-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.1 4.2-3.9 5.6l6.3 5.2C41.6 35.6 44 30.2 44 24c0-1.3-.1-2.4-.4-3.5z"/></svg>
            Continue with Google
          </button>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handle} className="space-y-3">
            {mode === "signup" && (
              <div>
                <label className="text-xs text-muted-foreground">Full name</label>
                <input
                  required value={name} onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full bg-input/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                  placeholder="Ada Lovelace"
                />
              </div>
            )}
            <div>
              <label className="text-xs text-muted-foreground">Email</label>
              <input
                required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full bg-input/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                placeholder="you@club.edu"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Password</label>
              <input
                required type="password" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full bg-input/40 border border-border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit" disabled={busy}
              className="w-full inline-flex items-center justify-center gap-2 bg-[var(--accent-purple)] text-white font-medium py-2.5 rounded-lg glow-purple hover:brightness-110 disabled:opacity-60 transition"
            >
              {busy ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-muted-foreground">
            {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <button onClick={() => setMode(mode === "signup" ? "signin" : "signup")} className="text-foreground hover:text-[var(--accent-purple)] underline-offset-2 hover:underline">
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

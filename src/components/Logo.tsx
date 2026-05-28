import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`flex items-center gap-2 ${className}`}>
      <div className="relative size-7 rounded-lg bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] glow-purple flex items-center justify-center">
        <div className="size-3 rounded-sm border-2 border-white/90" />
      </div>
      <span className="font-semibold tracking-tight text-base">Club Documentor</span>
    </Link>
  );
}

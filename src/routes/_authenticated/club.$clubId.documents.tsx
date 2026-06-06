import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { motion, AnimatePresence } from "motion/react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { AppShell } from "@/components/AppShell";
import { Skeleton } from "@/components/ui/skeleton";
import { editorAssist } from "@/lib/editor-ai.functions";
import { exportPDF, exportDOCX, renderMarkdown, sanitizeHtml } from "@/lib/export-utils";
import { toast } from "sonner";
import {
  FileText, Plus, Search, Sparkles, Bold, Italic, List, Heading1, Heading2,
  Quote, Wand2, BookOpenCheck, FileSignature, Gauge, ListTree, Image as ImageIcon,
  Download, FileDown, History, Loader2, Check, Trash2, Users,
} from "lucide-react";

export const Route = createFileRoute("/_authenticated/club/$clubId/documents")({
  head: () => ({ meta: [{ title: "Documents — Club Documentor" }] }),
  validateSearch: (s: Record<string, unknown>) => ({ doc: (s.doc as string) || undefined }),
  component: DocumentsEditor,
});

type Doc = { id: string; title: string; content: string; doc_type: string; updated_at: string; created_at: string; club_id: string };

function DocumentsEditor() {
  const { clubId } = Route.useParams();
  const { doc: selectedId } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const qc = useQueryClient();

  const [search, setSearch] = useState("");
  const [aiOpen, setAiOpen] = useState(true);

  const { data: docs = [], isLoading: docsLoading } = useQuery<Doc[]>({
    queryKey: ["documents", clubId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents").select("*").eq("club_id", clubId).order("updated_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Doc[];
    },
  });

  const filtered = useMemo(() =>
    docs.filter((d) => d.title.toLowerCase().includes(search.toLowerCase())), [docs, search]);

  // Auto-select first doc
  useEffect(() => {
    if (!selectedId && docs.length) {
      navigate({ to: ".", params: { clubId }, search: { doc: docs[0].id }, replace: true });
    }
  }, [selectedId, docs, clubId, navigate]);

  const active = docs.find((d) => d.id === selectedId) ?? null;

  const createDoc = async () => {
    const { data, error } = await supabase
      .from("documents")
      .insert({ club_id: clubId, title: "Untitled document", content: "# New document\n\nStart writing…", doc_type: "report", created_by: user!.id })
      .select().single();
    if (error) return toast.error(error.message);
    qc.invalidateQueries({ queryKey: ["documents", clubId] });
    navigate({ to: ".", params: { clubId }, search: { doc: (data as Doc).id }, replace: true });
  };

  return (
    <AppShell clubId={clubId} title="Documents">
      <div className="-m-6 lg:-m-8 h-[calc(100vh-3.5rem)] flex">
        {/* Left: documents list */}
        <aside className="hidden md:flex w-64 lg:w-72 flex-col border-r border-white/5 bg-background/40 backdrop-blur-xl">
          <div className="p-3 border-b border-white/5 space-y-2">
            <div className="relative">
              <Search className="size-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
              <input
                value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Search documents"
                className="w-full bg-white/[0.03] border border-white/5 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:ring-1 focus:ring-[var(--accent-purple)] outline-none"
              />
            </div>
            <button onClick={createDoc} className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-medium bg-[var(--accent-purple)]/90 hover:bg-[var(--accent-purple)] text-white rounded-lg py-1.5 transition glow-purple">
              <Plus className="size-3.5" /> New document
            </button>
          </div>
          <div className="flex-1 overflow-y-auto scrollbar-thin p-2 space-y-0.5">
            {docsLoading ? (
              [0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)
            ) : filtered.length === 0 ? (
              <div className="text-xs text-muted-foreground text-center py-10">No documents</div>
            ) : filtered.map((d) => (
              <button
                key={d.id}
                onClick={() => navigate({ to: ".", params: { clubId }, search: { doc: d.id } })}
                className={`w-full text-left px-2.5 py-2 rounded-lg transition group ${
                  d.id === selectedId ? "bg-white/[0.06] ring-1 ring-white/10" : "hover:bg-white/[0.03]"
                }`}
              >
                <div className="flex items-start gap-2">
                  <FileText className="size-3.5 mt-0.5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{d.title || "Untitled"}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{new Date(d.updated_at).toLocaleDateString()} · {d.doc_type}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Center: editor */}
        <section className="flex-1 min-w-0 flex flex-col bg-background/20">
          {active ? (
            <Editor key={active.id} doc={active} clubId={clubId} onAiToggle={() => setAiOpen((v) => !v)} />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <div className="text-center">
                <FileText className="size-10 mx-auto mb-3 opacity-50" />
                <p className="text-sm">Select or create a document to start</p>
              </div>
            </div>
          )}
        </section>

        {/* Right: AI assistant */}
        <AnimatePresence>
          {aiOpen && active && (
            <motion.aside
              initial={{ x: 320, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 320, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className="hidden lg:flex w-80 flex-col border-l border-white/5 bg-background/40 backdrop-blur-xl no-print"
            >
              <AIPanel doc={active} clubId={clubId} />
            </motion.aside>
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  );
}

/* ============== Editor ============== */
function Editor({ doc, clubId, onAiToggle }: { doc: Doc; clubId: string; onAiToggle: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const editorRef = useRef<HTMLDivElement>(null);
  const [title, setTitle] = useState(doc.title);
  const [content, setContent] = useState(doc.content);
  const [savedAt, setSavedAt] = useState<Date | null>(new Date(doc.updated_at));
  const [saving, setSaving] = useState(false);
  const [toolbar, setToolbar] = useState<{ x: number; y: number } | null>(null);
  const [activeUsers, setActiveUsers] = useState<{ id: string; name: string }[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const versionsRef = useRef<{ at: Date; content: string }[]>([]);

  // Auto-save (debounced)
  useEffect(() => {
    if (title === doc.title && content === doc.content) return;
    setSaving(true);
    const t = setTimeout(async () => {
      const { error } = await supabase
        .from("documents")
        .update({ title, content, updated_at: new Date().toISOString() })
        .eq("id", doc.id);
      setSaving(false);
      if (error) { toast.error("Save failed"); return; }
      setSavedAt(new Date());
      versionsRef.current = [{ at: new Date(), content }, ...versionsRef.current].slice(0, 20);
      qc.invalidateQueries({ queryKey: ["documents", clubId] });
    }, 900);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content]);

  // Realtime presence
  useEffect(() => {
    if (!user) return;
    const channel = supabase.channel(`doc:${doc.id}`, { config: { presence: { key: user.id } } });
    channel
      .on("presence", { event: "sync" }, () => {
        const state = channel.presenceState() as Record<string, any[]>;
        const users = Object.entries(state).map(([id, metas]) => ({ id, name: (metas[0] as any)?.name || "Member" }));
        setActiveUsers(users);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await channel.track({ name: user.email?.split("@")[0] ?? "Member" });
        }
      });
    return () => { supabase.removeChannel(channel); };
  }, [doc.id, user]);

  // Floating toolbar on selection
  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !editorRef.current?.contains(sel.anchorNode)) {
        setToolbar(null); return;
      }
      const range = sel.getRangeAt(0);
      const r = range.getBoundingClientRect();
      const containerRect = editorRef.current.getBoundingClientRect();
      setToolbar({ x: r.left + r.width / 2 - containerRect.left, y: r.top - containerRect.top - 44 });
    };
    document.addEventListener("selectionchange", handler);
    return () => document.removeEventListener("selectionchange", handler);
  }, []);

  // Initialize contentEditable from markdown (rendered) once per doc
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = renderMarkdown(doc.content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doc.id]);

  // Convert html back to plain markdown-ish on input (we store HTML in content)
  const onInput = () => {
    if (!editorRef.current) return;
    setContent(sanitizeHtml(editorRef.current.innerHTML));
  };

  const exec = (cmd: string, val?: string) => { document.execCommand(cmd, false, val); editorRef.current?.focus(); onInput(); };

  // Image upload
  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0]; if (!file) return;
    await uploadImage(file);
  };
  const uploadImage = async (file: File) => {
    try {
      const path = `${clubId}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("club-photos").upload(path, file);
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("club-photos").getPublicUrl(path);
      const url = data.publicUrl;
      document.execCommand("insertHTML", false, `<img src="${url}" alt="upload" style="max-width:100%;border-radius:12px;margin:8px 0" />`);
      onInput();
      // Also save as photo record
      await supabase.from("photos").insert({ club_id: clubId, url, uploaded_by: user!.id });
      toast.success("Image uploaded");
    } catch (err: any) { toast.error(err.message ?? "Upload failed"); }
  };

  const onDoExport = (kind: "pdf" | "docx") => {
    if (kind === "pdf") return exportPDF(title);
    // For DOCX, strip HTML to markdown-ish text
    const tmp = document.createElement("div"); tmp.innerHTML = sanitizeHtml(content);
    const md = htmlToMarkdown(tmp);
    exportDOCX(title, md);
  };

  return (
    <>
      {/* Top bar */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 lg:px-8 backdrop-blur-md bg-background/40 no-print">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            {saving ? <Loader2 className="size-3 animate-spin" /> : <Check className="size-3 text-emerald-400" />}
            {saving ? "Saving…" : savedAt ? `Saved ${timeAgo(savedAt)}` : "Synced"}
          </span>
          {activeUsers.length > 0 && (
            <span className="flex items-center gap-1.5 ml-2">
              <Users className="size-3" />
              <div className="flex -space-x-1.5">
                {activeUsers.slice(0, 4).map((u) => (
                  <div key={u.id} title={u.name} className="size-5 rounded-full bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] ring-2 ring-background flex items-center justify-center text-[9px] font-semibold text-white">
                    {u.name.slice(0, 1).toUpperCase()}
                  </div>
                ))}
              </div>
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          <ToolbarBtn onClick={() => setShowHistory((v) => !v)} icon={History} label="History" />
          <ToolbarBtn onClick={() => onDoExport("pdf")} icon={Download} label="PDF" />
          <ToolbarBtn onClick={() => onDoExport("docx")} icon={FileDown} label="DOCX" />
          <label className="cursor-pointer">
            <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])} />
            <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg hover:bg-white/[0.05] text-muted-foreground hover:text-foreground transition">
              <ImageIcon className="size-3.5" /> Image
            </span>
          </label>
          <button onClick={onAiToggle} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg bg-[var(--accent-purple)]/20 hover:bg-[var(--accent-purple)]/30 text-[var(--accent-purple)] transition">
            <Sparkles className="size-3.5" /> AI
          </button>
        </div>
      </div>

      {/* Editor canvas */}
      <div className="flex-1 overflow-y-auto scrollbar-thin print-area" onDragOver={(e) => e.preventDefault()} onDrop={onDrop}>
        <div className="max-w-3xl mx-auto px-6 lg:px-12 py-12 relative">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Untitled"
            className="w-full bg-transparent text-4xl font-semibold tracking-tight outline-none mb-6 placeholder:text-muted-foreground/40"
          />
          <div
            ref={editorRef}
            contentEditable
            suppressContentEditableWarning
            onInput={onInput}
            className="prose-doc focus:outline-none min-h-[60vh] text-[15px]"
          />

          {/* Floating toolbar */}
          <AnimatePresence>
            {toolbar && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.96 }}
                style={{ left: toolbar.x, top: toolbar.y }}
                className="absolute -translate-x-1/2 glass-strong rounded-xl px-1.5 py-1 flex items-center gap-0.5 ring-1 ring-white/10 shadow-2xl no-print z-20"
              >
                <FmtBtn onClick={() => exec("bold")} icon={Bold} />
                <FmtBtn onClick={() => exec("italic")} icon={Italic} />
                <div className="w-px h-5 bg-white/10 mx-0.5" />
                <FmtBtn onClick={() => exec("formatBlock", "h1")} icon={Heading1} />
                <FmtBtn onClick={() => exec("formatBlock", "h2")} icon={Heading2} />
                <FmtBtn onClick={() => exec("insertUnorderedList")} icon={List} />
                <FmtBtn onClick={() => exec("formatBlock", "blockquote")} icon={Quote} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Version history popover */}
          <AnimatePresence>
            {showHistory && (
              <motion.div
                initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
                className="fixed top-32 right-8 w-72 glass-strong rounded-2xl p-4 ring-1 ring-white/10 z-30 no-print"
              >
                <div className="text-sm font-semibold mb-2 flex items-center gap-2"><History className="size-4" /> Version history</div>
                <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                  {versionsRef.current.length === 0 ? (
                    <div className="text-xs text-muted-foreground">Edits will appear here as you work.</div>
                  ) : versionsRef.current.map((v, i) => (
                    <button key={i} onClick={() => { setContent(v.content); if (editorRef.current) editorRef.current.innerHTML = v.content; setShowHistory(false); }}
                      className="w-full text-left p-2 rounded-lg hover:bg-white/[0.05] transition">
                      <div className="text-xs font-medium">{v.at.toLocaleTimeString()}</div>
                      <div className="text-[10px] text-muted-foreground">Restore this version</div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

/* ============== AI Panel ============== */
function AIPanel({ doc, clubId }: { doc: Doc; clubId: string }) {
  const assist = useServerFn(editorAssist);
  const [busy, setBusy] = useState<string | null>(null);
  const [output, setOutput] = useState<string>("");
  const [outputLabel, setOutputLabel] = useState<string>("");

  const qc = useQueryClient();
  const { user } = useAuth();

  const run = async (action: any, label: string) => {
    setBusy(action); setOutput(""); setOutputLabel(label);
    try {
      const tmp = document.createElement("div");
      // Get latest content from DOM
      const editorEl = document.querySelector(".prose-doc") as HTMLDivElement | null;
      tmp.innerHTML = editorEl?.innerHTML ?? doc.content;
      const md = htmlToMarkdown(tmp);
      const res = await assist({ data: { action, content: md || doc.content } });
      setOutput(res.content);
    } catch (e: any) {
      toast.error(e.message ?? "AI request failed");
    } finally { setBusy(null); }
  };

  const replaceDoc = async () => {
    const html = renderMarkdown(output);
    const editorEl = document.querySelector(".prose-doc") as HTMLDivElement | null;
    if (editorEl) editorEl.innerHTML = html;
    await supabase.from("documents").update({ content: html }).eq("id", doc.id);
    qc.invalidateQueries({ queryKey: ["documents", clubId] });
    toast.success("Document updated");
  };

  const insertBelow = async () => {
    const editorEl = document.querySelector(".prose-doc") as HTMLDivElement | null;
    if (!editorEl) return;
    editorEl.innerHTML += renderMarkdown("\n\n" + output);
    await supabase.from("documents").update({ content: editorEl.innerHTML }).eq("id", doc.id);
    toast.success("Inserted into document");
  };

  const actions = [
    { id: "grammar", label: "Fix grammar & spelling", icon: BookOpenCheck, hint: "Polish writing without changing meaning" },
    { id: "formal", label: "Make tone formal", icon: FileSignature, hint: "Professional, official register" },
    { id: "summarize", label: "Generate summary", icon: Wand2, hint: "Executive summary of the document" },
    { id: "analyze", label: "Analyze quality", icon: Gauge, hint: "Strengths, weaknesses, score /10" },
    { id: "format", label: "Suggest formatting", icon: ListTree, hint: "Headings, lists, structure tips" },
    { id: "timeline", label: "Timeline → Report", icon: Sparkles, hint: "Convert notes into a polished report" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 border-b border-white/5 flex items-center gap-2">
        <div className="size-7 rounded-lg bg-gradient-to-br from-[var(--accent-purple)] to-[var(--accent-blue)] flex items-center justify-center"><Sparkles className="size-3.5 text-white" /></div>
        <div>
          <div className="text-sm font-semibold">AI Assistant</div>
          <div className="text-[10px] text-muted-foreground">Premium writing companion</div>
        </div>
      </div>

      <div className="p-3 space-y-1.5 overflow-y-auto scrollbar-thin">
        {actions.map((a) => (
          <motion.button
            key={a.id}
            whileHover={{ x: 2 }}
            disabled={!!busy}
            onClick={() => run(a.id, a.label)}
            className="w-full text-left p-3 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] ring-1 ring-white/5 hover:ring-[var(--accent-purple)]/40 transition disabled:opacity-50 group"
          >
            <div className="flex items-start gap-2.5">
              <div className="size-7 rounded-lg glass flex items-center justify-center shrink-0">
                {busy === a.id ? <Loader2 className="size-3.5 animate-spin" /> : <a.icon className="size-3.5 text-[var(--accent-purple)]" />}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium">{a.label}</div>
                <div className="text-[11px] text-muted-foreground mt-0.5">{a.hint}</div>
              </div>
            </div>
          </motion.button>
        ))}

        <AnimatePresence>
          {output && (
            <motion.div
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              className="mt-3 glass-strong gradient-border rounded-xl p-3"
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">{outputLabel}</div>
              <div className="prose-doc text-[13px] max-h-72 overflow-y-auto scrollbar-thin"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(output) }} />
              <div className="flex gap-1.5 mt-3">
                <button onClick={replaceDoc} className="flex-1 text-[11px] py-1.5 rounded-md bg-[var(--accent-purple)] text-white hover:brightness-110 transition">Replace</button>
                <button onClick={insertBelow} className="flex-1 text-[11px] py-1.5 rounded-md glass hover:bg-white/10 transition">Insert below</button>
                <button onClick={() => setOutput("")} className="text-[11px] px-2 py-1.5 rounded-md hover:bg-white/5 transition text-muted-foreground"><Trash2 className="size-3" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ============== Bits ============== */
function FmtBtn({ icon: Icon, onClick }: { icon: any; onClick: () => void }) {
  return (
    <button onMouseDown={(e) => { e.preventDefault(); onClick(); }}
      className="size-7 rounded-md hover:bg-white/10 flex items-center justify-center transition">
      <Icon className="size-3.5" />
    </button>
  );
}
function ToolbarBtn({ icon: Icon, label, onClick }: { icon: any; label: string; onClick: () => void }) {
  return (
    <button onClick={onClick} className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg hover:bg-white/[0.05] text-muted-foreground hover:text-foreground transition">
      <Icon className="size-3.5" /> {label}
    </button>
  );
}
function timeAgo(d: Date) {
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  return d.toLocaleTimeString();
}

// Lightweight HTML -> Markdown for export & AI input
function htmlToMarkdown(root: HTMLElement): string {
  const walk = (node: Node): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? "";
    if (node.nodeType !== Node.ELEMENT_NODE) return "";
    const el = node as HTMLElement;
    const inner = Array.from(el.childNodes).map(walk).join("");
    switch (el.tagName) {
      case "H1": return `\n# ${inner}\n\n`;
      case "H2": return `\n## ${inner}\n\n`;
      case "H3": return `\n### ${inner}\n\n`;
      case "STRONG": case "B": return `**${inner}**`;
      case "EM": case "I": return `*${inner}*`;
      case "LI": return `- ${inner}\n`;
      case "UL": case "OL": return `\n${inner}\n`;
      case "BLOCKQUOTE": return `\n> ${inner}\n\n`;
      case "BR": return "\n";
      case "P": case "DIV": return `${inner}\n\n`;
      case "IMG": return `![${el.getAttribute("alt") ?? ""}](${el.getAttribute("src") ?? ""})\n\n`;
      default: return inner;
    }
  };
  return walk(root).replace(/\n{3,}/g, "\n\n").trim();
}

import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const ACTIONS = {
  grammar: "Improve grammar, spelling, and punctuation of the document. Preserve meaning, formatting, and Markdown structure. Return only the corrected Markdown.",
  formal: "Rewrite the document in a polished, formal, professional tone suitable for an official college club document. Preserve all facts and Markdown structure. Return only the rewritten Markdown.",
  summarize: "Produce a concise executive summary (3-6 sentences) of the document. Plain Markdown, no preamble.",
  analyze: "Analyze the document quality. Return Markdown with sections: ## Strengths, ## Weaknesses, ## Suggestions, ## Score (out of 10). Be specific and actionable.",
  format: "Suggest formatting improvements (headings, bullet lists, emphasis, section ordering). Return Markdown bullet list of concrete suggestions. Do not rewrite the document.",
  timeline: "Convert the following rough event timeline / chronological notes into a polished, formal post-event report with sections: Overview, Objectives, Activities, Outcomes, Acknowledgements. Use Markdown.",
} as const;

const Input = z.object({
  action: z.enum(["grammar", "formal", "summarize", "analyze", "format", "timeline"]),
  content: z.string().min(1).max(20000),
});

export const editorAssist = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI service is not configured");
    const system = ACTIONS[data.action];

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: data.content },
        ],
      }),
    });
    if (res.status === 429) throw new Error("Rate limit reached. Try again shortly.");
    if (res.status === 402) throw new Error("AI credits exhausted.");
    if (!res.ok) throw new Error(`AI error: ${(await res.text()).slice(0, 200)}`);
    const json: any = await res.json();
    return { content: (json.choices?.[0]?.message?.content ?? "") as string };
  });

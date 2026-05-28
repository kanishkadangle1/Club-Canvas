import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const Input = z.object({
  clubId: z.string().uuid(),
  docType: z.enum([
    "report",
    "invitation",
    "permission",
    "sponsorship",
    "timeline_to_report",
    "enhance",
  ]),
  brief: z.string().min(1).max(8000),
  clubName: z.string().min(1).max(200).optional(),
});

const SYSTEM_PROMPTS: Record<string, string> = {
  report: "You are an expert at writing professional college-club event reports. Produce a polished, formal post-event report with clear sections: Overview, Objectives, Activities, Outcomes, Acknowledgements. Use Markdown.",
  invitation: "You are an expert at writing formal invitation letters for college club events. Produce a polished invitation letter with proper salutation, body explaining the event, and closing. Use Markdown.",
  permission: "You are an expert at writing formal permission letters from college clubs to faculty/admin. Produce a polished permission request letter. Use Markdown.",
  sponsorship: "You are an expert at writing sponsorship proposals from college clubs to local businesses. Produce a polished proposal: Introduction, Event details, Audience reach, Sponsorship tiers, Benefits, Call to action. Use Markdown.",
  timeline_to_report: "You are converting an event timeline (rough chronological notes) into a polished professional event report. Keep all facts but expand them into formal prose with sections. Use Markdown.",
  enhance: "You are enhancing the user's existing draft document. Improve clarity, professional tone, structure, and flow without changing the core meaning. Return the improved Markdown only.",
};

export const generateDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => Input.parse(d))
  .handler(async ({ data, context }) => {
    // Verify membership
    const { data: member } = await context.supabase
      .from("club_members")
      .select("role")
      .eq("club_id", data.clubId)
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!member) throw new Error("Not a member of this club");

    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) throw new Error("AI service is not configured");

    const system = SYSTEM_PROMPTS[data.docType];
    const userMsg = `Club: ${data.clubName ?? "Our Club"}\n\nBrief:\n${data.brief}`;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: system },
          { role: "user", content: userMsg },
        ],
      }),
    });

    if (res.status === 429) throw new Error("Rate limit reached. Try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted. Add credits in Settings → Workspace → Usage.");
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`AI service error: ${text.slice(0, 200)}`);
    }
    const json: any = await res.json();
    const content: string = json.choices?.[0]?.message?.content ?? "";
    return { content };
  });

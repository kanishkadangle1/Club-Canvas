import { marked } from "marked";
import { saveAs } from "file-saver";
import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
} from "docx";

export function exportPDF(title: string) {
  const original = document.title;
  document.title = title;
  window.print();
  setTimeout(() => { document.title = original; }, 500);
}

// Very small markdown -> docx converter (headings, paragraphs, lists, bold/italic)
export async function exportDOCX(title: string, markdown: string) {
  const tokens = marked.lexer(markdown);
  const children: Paragraph[] = [
    new Paragraph({ heading: HeadingLevel.TITLE, alignment: AlignmentType.LEFT, children: [new TextRun({ text: title, bold: true })] }),
    new Paragraph({ text: "" }),
  ];

  const inline = (text: string): TextRun[] => {
    const parts: TextRun[] = [];
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
    let last = 0; let m: RegExpExecArray | null;
    while ((m = regex.exec(text))) {
      if (m.index > last) parts.push(new TextRun(text.slice(last, m.index)));
      const s = m[0];
      if (s.startsWith("**")) parts.push(new TextRun({ text: s.slice(2, -2), bold: true }));
      else parts.push(new TextRun({ text: s.slice(1, -1), italics: true }));
      last = m.index + s.length;
    }
    if (last < text.length) parts.push(new TextRun(text.slice(last)));
    return parts.length ? parts : [new TextRun(text)];
  };

  for (const t of tokens) {
    if (t.type === "heading") {
      const level = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3, HeadingLevel.HEADING_4, HeadingLevel.HEADING_5, HeadingLevel.HEADING_6][Math.min(t.depth, 6) - 1];
      children.push(new Paragraph({ heading: level, children: inline(t.text) }));
    } else if (t.type === "paragraph") {
      children.push(new Paragraph({ children: inline(t.text) }));
    } else if (t.type === "list") {
      for (const item of t.items as any[]) {
        children.push(new Paragraph({ bullet: { level: 0 }, children: inline(item.text) }));
      }
    } else if (t.type === "blockquote") {
      children.push(new Paragraph({ children: inline((t as any).text), indent: { left: 360 } }));
    } else if (t.type === "space") {
      children.push(new Paragraph({ text: "" }));
    } else if (t.type === "code") {
      children.push(new Paragraph({ children: [new TextRun({ text: (t as any).text, font: "Consolas" })] }));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${title.replace(/[^a-z0-9-_ ]/gi, "_")}.docx`);
}

import DOMPurify from "dompurify";

export function renderMarkdown(md: string): string {
  const raw = marked.parse(md ?? "", { async: false }) as string;
  return DOMPurify.sanitize(raw, { USE_PROFILES: { html: true } });
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html ?? "", { USE_PROFILES: { html: true } });
}

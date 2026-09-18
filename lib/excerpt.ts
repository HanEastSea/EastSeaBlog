const MAX_EXCERPT_LENGTH = 88;

function cleanMarkdown(markdown: string, title = "") {
  const cleaned = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s{0,3}#{1,6}\s+/gm, "")
    .replace(/^\s*>\s?/gm, "")
    .replace(/^\s*(?:[-*+]\s+|\d+\.\s+)/gm, "")
    .replace(/[*_~`]/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (title && cleaned.startsWith(title)) {
    return cleaned.slice(title.length).replace(/^[：:，,。.!！?？\s]+/, "").trim();
  }
  return cleaned;
}

export function makeSmartExcerpt(markdown: string, title = "", fallback = "一条新的现场记录。") {
  const source = cleanMarkdown(markdown, title);
  if (!source) return fallback;

  const sentences = source.match(/[^。！？!?；;]+[。！？!?；;]?/g)?.map((sentence) => sentence.trim()).filter(Boolean) ?? [];
  let excerpt = "";
  for (const sentence of sentences) {
    const next = `${excerpt}${sentence}`;
    if (next.length > MAX_EXCERPT_LENGTH) break;
    excerpt = next;
    if (excerpt.length >= 48 && /[。！？!?；;]$/.test(excerpt)) break;
  }

  if (!excerpt) excerpt = source.slice(0, MAX_EXCERPT_LENGTH);
  return excerpt.length < source.length ? `${excerpt.replace(/[，,、；;：:]$/, "")}…` : excerpt;
}

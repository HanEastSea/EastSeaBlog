function escapeHtml(value: string) {
  return value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}

function safeUrl(value: string) {
  const url = value.trim();
  return /^https?:\/\//i.test(url) || url.startsWith("/") ? url : "#";
}

function inlineMarkdown(value: string) {
  let html = escapeHtml(value);
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt: string, url: string) => `<img src="${escapeHtml(safeUrl(url))}" alt="${escapeHtml(alt)}" loading="lazy" />`);
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label: string, url: string) => `<a href="${escapeHtml(safeUrl(url))}" target="_blank" rel="noreferrer">${label}</a>`);
  html = html.replace(/`([^`]+)`/g, "<code>$1</code>");
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/__([^_]+)__/g, "<strong>$1</strong>");
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>");
  html = html.replace(/_([^_]+)_/g, "<em>$1</em>");
  return html;
}

export function renderMarkdown(markdown: string) {
  const lines = markdown.replaceAll("\r\n", "\n").split("\n");
  const blocks: string[] = [];
  let paragraph: string[] = [];
  let listType: "ul" | "ol" | null = null;
  let listItems: string[] = [];
  let code: string[] | null = null;

  const flushParagraph = () => {
    if (paragraph.length) blocks.push(`<p>${inlineMarkdown(paragraph.join("\n"))}</p>`);
    paragraph = [];
  };
  const flushList = () => {
    if (!listType) return;
    blocks.push(`<${listType}>${listItems.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</${listType}>`);
    listType = null;
    listItems = [];
  };

  for (const line of lines) {
    if (code) {
      if (line.trim().startsWith("```")) {
        blocks.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
        code = null;
      } else code.push(line);
      continue;
    }
    if (line.trim().startsWith("```")) {
      flushParagraph();
      flushList();
      code = [];
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      blocks.push(`<h${heading[1].length}>${inlineMarkdown(heading[2])}</h${heading[1].length}>`);
      continue;
    }
    const quote = line.match(/^>\s?(.*)$/);
    if (quote) {
      flushParagraph();
      flushList();
      blocks.push(`<blockquote>${inlineMarkdown(quote[1])}</blockquote>`);
      continue;
    }
    if (/^(---+|\*\*\*-+)$/.test(line.trim())) {
      flushParagraph();
      flushList();
      blocks.push("<hr />");
      continue;
    }
    const list = line.match(/^\s*([-*+]|\d+\.)\s+(.+)$/);
    if (list) {
      flushParagraph();
      const nextType = /^\d/.test(list[1]) ? "ol" : "ul";
      if (listType && listType !== nextType) flushList();
      listType = nextType;
      listItems.push(list[2]);
      continue;
    }
    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }
    paragraph.push(line);
  }
  if (code) blocks.push(`<pre><code>${escapeHtml(code.join("\n"))}</code></pre>`);
  flushParagraph();
  flushList();
  return blocks.join("\n");
}

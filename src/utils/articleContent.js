const escapeHtml = (value) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const renderMarkdownContent = (raw) => {
  if (!raw) return "";

  let safe = escapeHtml(String(raw));
  safe = safe.replace(/&lt;u&gt;/g, "<u>").replace(/&lt;\/u&gt;/g, "</u>");

  safe = safe.replace(
    /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g,
    '<a href="$2" target="_blank" rel="noreferrer" class="text-red-400 underline">$1</a>'
  );

  safe = safe.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  safe = safe.replace(/\*([^*]+)\*/g, "<em>$1</em>");

  const lines = safe.split(/\r?\n/);
  let html = "";
  let inUl = false;
  let inOl = false;

  const closeLists = () => {
    if (inUl) {
      html += "</ul>";
      inUl = false;
    }
    if (inOl) {
      html += "</ol>";
      inOl = false;
    }
  };

  lines.forEach((line) => {
    const trimmed = line.trim();

    if (!trimmed) {
      closeLists();
      return;
    }

    if (trimmed.startsWith("### ")) {
      closeLists();
      html += `<h3 class="text-white text-xl font-bold mt-4 mb-2">${trimmed.slice(4)}</h3>`;
      return;
    }

    if (trimmed.startsWith("> ")) {
      closeLists();
      html += `<blockquote class="border-l-2 border-red-500/60 pl-4 text-zinc-300 italic mb-3">${trimmed.slice(2)}</blockquote>`;
      return;
    }

    if (trimmed.startsWith("- ")) {
      if (!inUl) {
        closeLists();
        html += '<ul class="list-disc pl-6 space-y-1 mb-3">';
        inUl = true;
      }
      html += `<li>${trimmed.slice(2)}</li>`;
      return;
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      if (!inOl) {
        closeLists();
        html += '<ol class="list-decimal pl-6 space-y-1 mb-3">';
        inOl = true;
      }
      const content = trimmed.replace(/^\d+\.\s+/, "");
      html += `<li>${content}</li>`;
      return;
    }

    closeLists();
    html += `<p class="mb-3">${trimmed}</p>`;
  });

  closeLists();
  return html;
};

const ALLOWED_TAGS = new Set([
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "strike",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "blockquote",
  "a",
  "span",
]);

const CLASS_MAP = {
  h2: "text-white text-2xl font-bold mt-5 mb-3",
  h3: "text-white text-xl font-bold mt-4 mb-2",
  h4: "text-white text-lg font-semibold mt-4 mb-2",
  p: "mb-3",
  blockquote: "border-l-2 border-red-500/60 pl-4 text-zinc-300 italic mb-3",
  ul: "list-disc pl-6 space-y-1 mb-3",
  ol: "list-decimal pl-6 space-y-1 mb-3",
  a: "text-red-400 underline",
};

const SAFE_PROTOCOLS = ["http:", "https:", "mailto:", "tel:"];

const isSafeHref = (value) => {
  if (!value) return false;
  try {
    const parsed = new URL(value, window.location.origin);
    return SAFE_PROTOCOLS.includes(parsed.protocol);
  } catch {
    return false;
  }
};

export const sanitizeArticleHtml = (raw, options = {}) => {
  if (!raw) return "";
  if (typeof DOMParser === "undefined") {
    return escapeHtml(String(raw));
  }

  const { withClasses = true } = options;
  const parser = new DOMParser();
  const doc = parser.parseFromString(String(raw), "text/html");
  const elements = Array.from(doc.body.querySelectorAll("*"));

  elements.forEach((element) => {
    let tag = element.tagName.toLowerCase();

    if (tag === "script" || tag === "style" || tag === "iframe") {
      element.remove();
      return;
    }

    if (tag === "div") {
      const replacement = doc.createElement("p");
      while (element.firstChild) {
        replacement.appendChild(element.firstChild);
      }
      element.replaceWith(replacement);
      element = replacement;
      tag = "p";
    }

    if (!ALLOWED_TAGS.has(tag)) {
      const parent = element.parentNode;
      if (!parent) {
        element.remove();
        return;
      }
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
      return;
    }

    Array.from(element.attributes).forEach((attr) => {
      const name = attr.name.toLowerCase();
      if (name.startsWith("on") || name === "style") {
        element.removeAttribute(attr.name);
        return;
      }
      if (tag === "a") {
        if (!name.includes("href") && name !== "target" && name !== "rel") {
          element.removeAttribute(attr.name);
        }
        return;
      }
      if (name !== "class") {
        element.removeAttribute(attr.name);
      }
    });

    if (tag === "a") {
      const href = element.getAttribute("href") || "";
      if (!isSafeHref(href)) {
        element.removeAttribute("href");
      } else {
        element.setAttribute("target", "_blank");
        element.setAttribute("rel", "noreferrer");
      }
    }

    if (withClasses && CLASS_MAP[tag]) {
      element.setAttribute("class", CLASS_MAP[tag]);
    } else if (!withClasses) {
      element.removeAttribute("class");
    }
  });

  return doc.body.innerHTML.trim();
};

const markdownPatterns = [
  /(^|\n)\s*###\s+/, 
  /(^|\n)\s*>\s+/, 
  /(^|\n)\s*-\s+/, 
  /(^|\n)\s*\d+\.\s+/, 
  /\*\*[^*]+\*\*/, 
  /\*[^*\n]+\*/, 
  /\[[^\]]+\]\((https?:\/\/[^)]+)\)/,
];

const looksLikeMarkdown = (value) =>
  markdownPatterns.some((pattern) => pattern.test(value));

const looksLikeHtmlBlock = (value) =>
  /<\/?(p|div|h\d|ul|ol|li|blockquote|br)\b/i.test(value);

const looksLikeHtml = (value) => /<\/?[a-z][\s\S]*>/i.test(value);

export const renderArticleContent = (raw) => {
  if (!raw) return "";
  const text = String(raw);
  if (looksLikeHtmlBlock(text)) {
    return sanitizeArticleHtml(text, { withClasses: true });
  }
  if (looksLikeHtml(text) && !looksLikeMarkdown(text)) {
    return sanitizeArticleHtml(text, { withClasses: true });
  }
  return renderMarkdownContent(text);
};

/**
 * Converts existing Quill-authored HTML (from `RichTextEditor`, the WYSIWYG
 * editor the Markdown editor replaces) into Markdown, purely so an instructor
 * opening an existing Lesson/Lesson/Topic/Content for edit sees readable
 * Markdown source instead of raw `<p>`/`<strong>` tags. Never used on save —
 * only to seed an editor's initial value.
 *
 * Quill's toolbar (see RichTextEditor.jsx `modules`/`formats`) only ever
 * produces a small, closed set of tags: h1-h3, p, strong/em/u/s, blockquote,
 * ul/ol/li, a, and a single `<pre class="ql-syntax">` code block — small
 * enough to walk by hand without a general-purpose HTML→MD dependency.
 */

const LOOKS_LIKE_HTML = /^\s*<(p|h[1-6]|div|ul|ol|blockquote|pre)[\s>]/i;

function escapeMdText(text) {
  return text.replace(/([\\`*_[\]])/g, "\\$1");
}

function inlineToMarkdown(node) {
  let out = "";
  for (const child of node.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      out += escapeMdText(child.textContent);
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;

    switch (child.tagName) {
      case "STRONG":
      case "B":
        out += `**${inlineToMarkdown(child)}**`;
        break;
      case "EM":
      case "I":
        out += `*${inlineToMarkdown(child)}*`;
        break;
      case "S":
      case "STRIKE":
      case "DEL":
        out += `~~${inlineToMarkdown(child)}~~`;
        break;
      case "U":
        // CommonMark has no native underline syntax; passing the tag through
        // inline is safe since the renderer (marked + DOMPurify) allows it.
        out += `<u>${inlineToMarkdown(child)}</u>`;
        break;
      case "CODE":
        out += `\`${child.textContent}\``;
        break;
      case "A": {
        const href = child.getAttribute("href") || "";
        out += `[${inlineToMarkdown(child)}](${href})`;
        break;
      }
      case "BR":
        out += "\n";
        break;
      default:
        out += inlineToMarkdown(child);
    }
  }
  return out;
}

function listToMarkdown(listEl, ordered, depth) {
  const indent = "  ".repeat(depth);
  const lines = [];
  let index = 1;
  for (const li of listEl.children) {
    if (li.tagName !== "LI") continue;
    const nestedLists = Array.from(li.children).filter((c) => c.tagName === "UL" || c.tagName === "OL");
    const clone = li.cloneNode(true);
    nestedLists.forEach((_, i) => {
      const toRemove = Array.from(clone.children).filter((c) => c.tagName === "UL" || c.tagName === "OL");
      if (toRemove[i]) clone.removeChild(toRemove[i]);
    });
    const marker = ordered ? `${index}.` : "-";
    lines.push(`${indent}${marker} ${inlineToMarkdown(clone).trim()}`);
    for (const nested of nestedLists) {
      lines.push(listToMarkdown(nested, nested.tagName === "OL", depth + 1));
    }
    index += 1;
  }
  return lines.join("\n");
}

function blockToMarkdown(el) {
  switch (el.tagName) {
    case "H1":
      return `# ${inlineToMarkdown(el).trim()}`;
    case "H2":
      return `## ${inlineToMarkdown(el).trim()}`;
    case "H3":
      return `### ${inlineToMarkdown(el).trim()}`;
    case "H4":
      return `#### ${inlineToMarkdown(el).trim()}`;
    case "H5":
      return `##### ${inlineToMarkdown(el).trim()}`;
    case "H6":
      return `###### ${inlineToMarkdown(el).trim()}`;
    case "BLOCKQUOTE":
      return inlineToMarkdown(el)
        .trim()
        .split("\n")
        .map((line) => `> ${line}`)
        .join("\n");
    case "UL":
      return listToMarkdown(el, false, 0);
    case "OL":
      return listToMarkdown(el, true, 0);
    case "PRE":
      // Quill's code-block: a single flat <pre>, no language info.
      return "```\n" + el.textContent.replace(/\n+$/, "") + "\n```";
    case "P":
    case "DIV": {
      const text = inlineToMarkdown(el).trim();
      return text;
    }
    default:
      return inlineToMarkdown(el).trim();
  }
}

/**
 * Returns `value` unchanged unless it looks like HTML, in which case it's
 * walked into Markdown. Plain-text values (e.g. Module's existing
 * `description`, which was never HTML) and already-Markdown values pass
 * through untouched — safe to call unconditionally when seeding an editor.
 */
export function htmlToMarkdown(value) {
  if (!value || typeof value !== "string") return value ?? "";
  if (typeof window === "undefined" || typeof DOMParser === "undefined") return value;
  if (!LOOKS_LIKE_HTML.test(value)) return value;

  const doc = new DOMParser().parseFromString(value, "text/html");
  const blocks = [];
  for (const child of doc.body.childNodes) {
    if (child.nodeType === Node.TEXT_NODE) {
      const text = child.textContent.trim();
      if (text) blocks.push(escapeMdText(text));
      continue;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) continue;
    const md = blockToMarkdown(child);
    if (md) blocks.push(md);
  }
  return blocks.join("\n\n");
}

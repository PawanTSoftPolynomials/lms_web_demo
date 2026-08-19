import { Marked } from "marked";
import DOMPurify from "isomorphic-dompurify";
import hljs from "highlight.js/lib/core";

import { rewritePrivateBlobUrlsInHtml } from "@/lib/blob";

import javascript from "highlight.js/lib/languages/javascript";
import typescript from "highlight.js/lib/languages/typescript";
import python from "highlight.js/lib/languages/python";
import java from "highlight.js/lib/languages/java";
import c from "highlight.js/lib/languages/c";
import cpp from "highlight.js/lib/languages/cpp";
import csharp from "highlight.js/lib/languages/csharp";
import sql from "highlight.js/lib/languages/sql";
import json from "highlight.js/lib/languages/json";
import xml from "highlight.js/lib/languages/xml";
import css from "highlight.js/lib/languages/css";
import bash from "highlight.js/lib/languages/bash";

const LANGUAGES = {
  javascript,
  js: javascript,
  jsx: javascript,
  typescript,
  ts: typescript,
  tsx: typescript,
  python,
  py: python,
  java,
  c,
  cpp,
  "c++": cpp,
  csharp,
  "c#": csharp,
  cs: csharp,
  sql,
  json,
  xml,
  html: xml,
  css,
  bash,
  sh: bash,
  shell: bash,
};

let registered = false;
function ensureLanguagesRegistered() {
  if (registered) return;
  for (const [name, def] of Object.entries(LANGUAGES)) {
    if (!hljs.getLanguage(name)) hljs.registerLanguage(name, def);
  }
  registered = true;
}

/** Manual escape for code text that isn't run through highlight.js (unregistered/missing language). */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    code({ text, lang }) {
      ensureLanguagesRegistered();
      const language = lang ? lang.toLowerCase().trim().split(/\s+/)[0] : "";
      const highlighted = hljs.getLanguage(language)
        ? hljs.highlight(text, { language }).value
        : escapeHtml(text);
      const langClass = hljs.getLanguage(language) ? ` language-${language} hljs` : " hljs";
      return `<pre><code class="${langClass.trim()}">${highlighted}</code></pre>`;
    },
  },
});

/**
 * Renders a Markdown (or, for not-yet-migrated legacy rows, raw HTML — `marked`
 * passes untouched HTML blocks straight through) source string to sanitized HTML
 * safe for `dangerouslySetInnerHTML`. Single source of truth for every "view mode"
 * render of a Module/Lesson/Topic description or Content text block.
 */
export function renderMarkdownToSafeHtml(source) {
  if (!source) return "";
  const html = marked.parse(source);
  const safeHtml = DOMPurify.sanitize(html, { ADD_ATTR: ["target"] });
  // Imported lesson content can carry raw <img>/<a> URLs pointing straight at
  // a private Vercel Blob file — those 403 unless routed through the
  // /api/blob-proxy proxy that getDisplayUrl() otherwise handles for us.
  return rewritePrivateBlobUrlsInHtml(safeHtml);
}

/**
 * The backend's `Content.htmlContent` field (unlike Module/Lesson/Topic
 * `description`) is run through a server-side `sanitize-html` pass on every
 * create/update, which parses the value as HTML and silently deletes anything
 * that looks like an unrecognized tag (e.g. Markdown `List<String>` or a
 * `<https://...>` autolink lose the bracketed part entirely). Escaping the
 * three HTML metacharacters before sending, and decoding them back after
 * reading, round-trips the raw Markdown through that pass unchanged — verified
 * against the real backend sanitizer for headings, code fences, blockquotes,
 * and autolinks. Only the Content "text" cell needs this; Module/Lesson/Topic
 * `description` has no server-side processing at all.
 */
export function escapeForContentApi(markdown) {
  if (!markdown) return markdown;
  return markdown.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function unescapeFromContentApi(html) {
  if (!html) return html;
  return html.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
}

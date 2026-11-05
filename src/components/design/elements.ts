import { splitElementKey, type ElementEdit } from "@/lib/design/regions";

const STYLE_ID = "design-elements";

function cssFor(selector: string, e: ElementEdit): string {
  if (e.hidden) return `${selector}{display:none !important}`;
  const d: string[] = [];
  if (e.bg) d.push(`background-color:${e.bg} !important`);
  if (e.color) d.push(`color:${e.color} !important`);
  if (e.scale) d.push(`zoom:${e.scale / 100}`);
  if (e.image) d.push(`background-image:url("${e.image}") !important`, "background-size:cover !important", "background-position:center !important");
  return d.length ? `${selector}{${d.join(";")}}` : "";
}

/** Aplica al documento las ediciones que corresponden a esta ruta (las de «*» valen para todo el sitio). */
export function applyElements(doc: Document, path: string, elements: Record<string, ElementEdit>) {
  const rules: string[] = [];
  for (const [key, e] of Object.entries(elements)) {
    const k = splitElementKey(key);
    if (!k || (k.path !== "*" && k.path !== path)) continue;
    const r = cssFor(k.selector, e);
    if (r) rules.push(r);
    let el: Element | null = null;
    try {
      el = doc.querySelector(k.selector);
    } catch {
      continue;
    }
    if (!el) continue;
    if (e.text !== undefined && el.children.length === 0 && el.textContent !== e.text) el.textContent = e.text;
    if (e.href && el instanceof HTMLAnchorElement && el.getAttribute("href") !== e.href) el.setAttribute("href", e.href);
    if (e.image && el instanceof HTMLImageElement && el.getAttribute("src") !== e.image) {
      el.removeAttribute("srcset");
      el.setAttribute("src", e.image);
    }
  }
  let style = doc.getElementById(STYLE_ID);
  if (!style) {
    style = doc.createElement("style");
    style.id = STYLE_ID;
    doc.head.appendChild(style);
  }
  const css = rules.join("\n");
  if (style.textContent !== css) style.textContent = css;
}

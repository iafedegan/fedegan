import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, ExternalLink, FileText } from "lucide-react";
import type { LegacyBlock } from "@/content/legacy";

const TOKEN = /\*\*([^*]+)\*\*|\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g;
const FILE = /\.(pdf|docx?|xlsx?|pptx?|zip|rar)(\?|$)/i;

const linkClass =
  "font-semibold text-[var(--fg-lime-400)] underline decoration-[rgba(216,181,88,0.45)] underline-offset-[3px] transition-colors hover:text-[var(--text)] hover:decoration-[var(--fg-lime-400)]";

function Inline({ text }: { text: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  let i = 0;
  const pushText = (s: string) => {
    s.split("\n").forEach((line, n) => {
      if (n > 0) out.push(<br key={`br${i++}`} />);
      if (line) out.push(line);
    });
  };
  for (const m of text.matchAll(TOKEN)) {
    pushText(text.slice(last, m.index));
    last = (m.index ?? 0) + m[0].length;
    if (m[1] !== undefined) {
      out.push(
        <strong key={`s${i++}`} className="font-bold text-[var(--text)]">
          {m[1]}
        </strong>,
      );
      continue;
    }
    const [, , label, href] = m;
    const external = !href.startsWith("/");
    out.push(
      external ? (
        <a key={`a${i++}`} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {label || href}
          {FILE.test(href) ? (
            <FileText size={13} aria-hidden className="ml-1 inline -translate-y-px" />
          ) : (
            <ArrowUpRight size={13} aria-hidden className="ml-0.5 inline -translate-y-px" />
          )}
        </a>
      ) : (
        <Link key={`a${i++}`} href={href} className={linkClass}>
          {label || href}
        </Link>
      ),
    );
  }
  pushText(text.slice(last));
  return <>{out}</>;
}

// Celdas con varias líneas: los enlaces sueltos van como lista y el resto como párrafos.
function CellLines({ text }: { text: string }) {
  const lines = text.split("\n").filter(Boolean);
  if (lines.length <= 1) return <Inline text={text} />;
  return (
    <>
      {lines.map((ln, n) => {
        const onlyLink = /^\[[^\]]+\]\([^)]+\)$/.test(ln);
        return (
          <span key={n} className={onlyLink ? "block" : "mt-1 block"}>
            <Inline text={ln} />
          </span>
        );
      })}
    </>
  );
}

type EmbedInfo = { kind: "video" | "link"; src: string; href: string; title: string; hint: string };

// Los marcos incrustados del portal actual: los videos se incrustan (sin cookies); el resto, como tarjeta con enlace.
function embedInfo(raw: string): EmbedInfo {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return { kind: "link", src: raw, href: raw, title: "Contenido relacionado", hint: "Se abre en una pestaña nueva." };
  }
  const host = u.hostname.replace(/^www\./, "");
  if (host.endsWith("youtube.com") && u.pathname.startsWith("/embed/")) {
    const id = u.pathname.split("/")[2];
    const list = u.searchParams.get("list");
    const src = id && id !== "videoseries" ? `https://www.youtube-nocookie.com/embed/${id}` : `https://www.youtube-nocookie.com/embed/videoseries?list=${list ?? ""}`;
    const href = id && id !== "videoseries" ? `https://www.youtube.com/watch?v=${id}` : `https://www.youtube.com/playlist?list=${list ?? ""}`;
    return { kind: "video", src, href, title: "Video", hint: "Ver en YouTube" };
  }
  if (host === "docs.google.com" && u.searchParams.get("url")) {
    const file = u.searchParams.get("url")!;
    return { kind: "link", src: raw, href: file, title: "Documento", hint: decodeURIComponent(file.split("/").pop() ?? "Abrir documento") };
  }
  if (host.includes("slideshare")) return { kind: "link", src: raw, href: raw, title: "Presentación", hint: "Se abre en SlideShare." };
  if (host.includes("heyzine")) return { kind: "link", src: raw, href: raw, title: "Publicación interactiva", hint: "Se abre en una pestaña nueva." };
  if (host.startsWith("estadisticas.fedegan")) return { kind: "link", src: raw, href: raw, title: "Tablero interactivo", hint: "Se abre en el sitio de estadísticas de FEDEGÁN." };
  return { kind: "link", src: raw, href: raw, title: "Documento", hint: "Se abre en una pestaña nueva." };
}

const isLabel = (b: LegacyBlock | undefined) => b?.t === "p" && /:$/.test(b.text ?? "") && (b.text ?? "").length <= 26;

// Pinta el texto copiado (títulos, párrafos, listas, tablas y tableros) con el estilo del portal.
export function LegacyContent({ blocks }: { blocks: LegacyBlock[] }) {
  const nodes: ReactNode[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const key = `b${i}`;

    if (b.t === "li") {
      const items: LegacyBlock[] = [];
      while (i < blocks.length && blocks[i].t === "li") items.push(blocks[i++]);
      i--;
      nodes.push(
        <ul key={key} className="my-5 flex flex-col gap-2.5 pl-1">
          {items.map((it, n) => (
            <li key={n} className="relative pl-6 leading-relaxed text-[var(--text-muted)] before:absolute before:left-1 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--fg-lime-500)]">
              <Inline text={it.text ?? ""} />
            </li>
          ))}
        </ul>,
      );
      continue;
    }

    if (b.t === "table") {
      const rows = b.rows ?? [];
      // Celdas largas o con varias líneas: son tarjetas (programas, enlaces); se apilan en pantallas angostas.
      const cards = rows.some((r) => r.some((c) => c.includes("\n") || c.length > 90));
      nodes.push(
        cards ? (
          <ul key={key} className="my-6 grid gap-3 sm:grid-cols-2">
            {rows.flat().filter(Boolean).map((c, n) => (
              <li key={n} className="flex flex-col gap-1.5 rounded-[var(--radius-md)] border border-[var(--border)] bg-[var(--surface-2)] p-4 leading-relaxed text-[var(--text-muted)]">
                <CellLines text={c} />
              </li>
            ))}
          </ul>
        ) : (
          <div key={key} className="my-6 overflow-x-auto rounded-[var(--radius-md)] border border-[var(--border-strong)]">
            <table className="w-full border-collapse text-left text-sm">
              <tbody>
                {rows.map((r, n) => (
                  <tr key={n} className="border-b border-[var(--border)] last:border-0 odd:bg-[var(--surface-2)]">
                    {r.map((c, m) => (
                      <td key={m} className="p-3 align-top leading-relaxed text-[var(--text-muted)]">
                        <CellLines text={c} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ),
      );
      continue;
    }

    if (b.t === "embed") {
      const e = embedInfo(b.text ?? "");
      nodes.push(
        e.kind === "video" ? (
          <div key={key} className="my-6">
            <div className="aspect-video overflow-hidden rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-black">
              <iframe
                src={e.src}
                title="Video de FEDEGÁN"
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="h-full w-full"
              />
            </div>
            <a href={e.href} target="_blank" rel="noopener noreferrer" className={`${linkClass} mt-2 inline-block text-sm`}>
              {e.hint}
            </a>
          </div>
        ) : (
          <a
            key={key}
            href={e.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group my-5 flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--border-strong)] bg-[var(--surface-2)] p-4 transition-colors hover:border-[var(--fg-lime-500)] sm:p-5"
          >
            <span className="min-w-0">
              <span className="block font-[var(--font-display)] text-lg font-bold text-[var(--text)]">{e.title}</span>
              <span className="mt-0.5 block truncate text-sm text-[var(--text-muted)]">{e.hint}</span>
            </span>
            <ExternalLink size={20} className="shrink-0 text-[var(--fg-lime-400)] transition-transform group-hover:translate-x-0.5" />
          </a>
        ),
      );
      continue;
    }

    if (/^h[2-6]$/.test(b.t)) {
      const big = b.t === "h2";
      const Tag = (big ? "h2" : "h3") as "h2" | "h3";
      nodes.push(
        <Tag
          key={key}
          className={
            big
              ? "mb-3 mt-10 font-[var(--font-display)] text-2xl font-bold leading-snug text-[var(--text)] first:mt-0 sm:text-[1.7rem]"
              : "mb-2 mt-8 font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)] first:mt-0"
          }
        >
          <Inline text={b.text ?? ""} />
        </Tag>,
      );
      continue;
    }

    // etiqueta + valor ("Autor:" / "José …") en una sola línea
    if (isLabel(b) && blocks[i + 1]?.t === "p" && !isLabel(blocks[i + 1])) {
      nodes.push(
        <p key={key} className="my-1.5 leading-relaxed text-[var(--text-muted)]">
          <span className="mr-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">{b.text}</span>
          <Inline text={blocks[i + 1].text ?? ""} />
        </p>,
      );
      i++;
      continue;
    }

    nodes.push(
      <p key={key} className="my-4 text-[1.02rem] leading-[1.75] text-[var(--text-muted)]">
        <Inline text={b.text ?? ""} />
      </p>,
    );
  }
  return <div className="min-w-0">{nodes}</div>;
}

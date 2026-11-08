import type { ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import type { LegacyBlock } from "@/content/legacy";
import { Inline, linkClass } from "./Inline";
import { BLOQUES_RICOS, BloqueRico } from "./BloquesRicos";
import { UploadDocs } from "./UploadDocs";
import { EntryExplorer, type ExplorerEntry } from "./EntryExplorer";
import { DocList, tarjetasDeDocumentos } from "./DocList";

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
  if (host.endsWith("tableau.com")) return { kind: "link", src: raw, href: raw, title: "Tablero interactivo", hint: "Indicadores de seguimiento · se abre en Tableau Public." };
  if (host.startsWith("estadisticas.fedegan")) return { kind: "link", src: raw, href: raw, title: "Tablero interactivo", hint: "Se abre en el sitio de estadísticas de FEDEGÁN." };
  return { kind: "link", src: raw, href: raw, title: "Documento", hint: "Se abre en una pestaña nueva." };
}

const isLabel = (b: LegacyBlock | undefined) => b?.t === "p" && /:$/.test(b.text ?? "") && (b.text ?? "").length <= 26;


type Entry = { title: string; meta: [string, string][]; desc: string[] };

const LINK_ONLY = /^\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)$/;
const MORE = /\[más›\]\([^)]*\)|más›/gi;
const CODE = /^([A-Z]{1,5}[-–]\d{2,4}[-–]\d{4})\s*[:\-–]\s*(.+)$/;

// Agrupa «título enlazado + datos + descripción» (publicaciones, cartas, comunicados) para pintarlos como lista.
function takeEntries(blocks: LegacyBlock[], from: number): { entries: Entry[]; next: number } | null {
  const entries: Entry[] = [];
  let i = from;
  while (i < blocks.length && blocks[i].t === "h3" && LINK_ONLY.test((blocks[i].text ?? "").trim())) {
    const e: Entry = { title: (blocks[i].text ?? "").trim(), meta: [], desc: [] };
    i++;
    while (i < blocks.length && blocks[i].t === "p") {
      const t = (blocks[i].text ?? "").trim();
      const nx = blocks[i + 1];
      if (isLabel(blocks[i]) && nx?.t === "p" && !isLabel(nx)) {
        e.meta.push([t.replace(/:$/, ""), (nx.text ?? "").trim()]);
        i += 2;
        continue;
      }
      const clean = t.replace(MORE, "").trim();
      if (clean) e.desc.push(clean);
      i++;
    }
    entries.push(e);
  }
  return entries.length >= 2 ? { entries, next: i } : null;
}

const plain = (s: string) => s.replace(/\[([^\]]*)\]\([^)]*\)/g, "$1").replace(/\*\*/g, "").replace(/\s+/g, " ").trim();

function toExplorer(entries: Entry[]): ExplorerEntry[] {
  return entries.map((e) => {
    const m = LINK_ONLY.exec(e.title)!;
    const parsed = CODE.exec(m[1].trim());
    return {
      title: parsed ? parsed[2] : m[1].trim(),
      code: parsed?.[1],
      href: m[2],
      desc: plain(e.desc.join(" ")),
      meta: e.meta.map(([k, v]) => [k, plain(v)] as [string, string]),
    };
  });
}

// Pinta el texto copiado (títulos, párrafos, listas, tablas y tableros) con el estilo del portal.
// `libre`: páginas armadas en el constructor. Cada elemento se pinta tal cual, sin las reglas que reagrupan el texto copiado
// del portal actual (primer párrafo destacado, fichas por subtítulo, listas de publicaciones), para que la página se vea
// igual que en el editor. `preview`: vista previa dentro del editor (sin anclas ni movimiento).
export function LegacyContent({ blocks, lead: allowLead = true, preview = false, libre = false }: { blocks: LegacyBlock[]; lead?: boolean; preview?: boolean; libre?: boolean }) {
  const nodes: ReactNode[] = [];
  let leadDone = !allowLead || libre;
  // Páginas con varios apartados de tercer nivel (programas, servicios…): cada apartado va en su propia ficha.
  const grouped3 = allowLead && !libre && blocks.filter((x) => x.t === "h3").length >= 3;
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    const key = `b${i}`;

    if (BLOQUES_RICOS.has(b.t)) {
      nodes.push(<BloqueRico key={key} b={b} preview={preview} />);
      continue;
    }

    if (b.t === "h3" && !libre) {
      const grouped = takeEntries(blocks, i);
      if (grouped) {
        nodes.push(<EntryExplorer key={key} entries={toExplorer(grouped.entries)} />);
        i = grouped.next - 1;
        continue;
      }
    }

    if (b.t === "h3" && grouped3) {
      let j = i + 1;
      while (j < blocks.length && !/^h[1-6]$/.test(blocks[j].t)) j++;
      nodes.push(
        <section key={key} className="ed-item">
          <h3 id={preview ? undefined : `s${i}`} className="font-[var(--font-display)] text-xl font-bold leading-snug text-[var(--text)]">
            <Inline text={b.text ?? ""} />
          </h3>
          <LegacyContent blocks={blocks.slice(i + 1, j)} lead={false} libre={libre} />
        </section>,
      );
      i = j - 1;
      continue;
    }

    if (b.t === "li") {
      const items: LegacyBlock[] = [];
      while (i < blocks.length && blocks[i].t === "li") items.push(blocks[i++]);
      i--;
      const docs = tarjetasDeDocumentos(items);
      if (docs) {
        nodes.push(<DocList key={key} tarjetas={docs} />);
        continue;
      }
      nodes.push(
        <ul key={key} className="my-5 flex max-w-4xl flex-col gap-2.5 pl-1">
          {items.map((it, n) => (
            <li key={n} className="read relative pl-6 text-[1.05rem] leading-relaxed text-[var(--text-muted)] before:absolute before:left-1 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[var(--fg-lime-500)]">
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
          <ul key={key} className="my-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {rows.flat().filter(Boolean).map((c, n) => (
              <li key={n} className="mx-card mx-lift flex flex-col gap-1.5 !p-5 leading-relaxed text-[var(--text-muted)]">
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

    if (b.t === "upload") {
      nodes.push(<UploadDocs key={key} label={b.text ?? "Cargar documentos"} preview={preview} />);
      continue;
    }

    if (b.t === "embed") {
      const e = embedInfo(b.text ?? "");
      nodes.push(
        e.kind === "video" ? (
          <div key={key} className="my-6 max-w-[40rem]">
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
          id={preview ? undefined : `s${i}`}
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
    if (!libre && isLabel(b) && blocks[i + 1]?.t === "p" && !isLabel(blocks[i + 1])) {
      nodes.push(
        <p key={key} className="my-1.5 max-w-4xl leading-relaxed text-[var(--text-muted)]">
          <span className="mr-2 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-[var(--text-faint)]">{b.text}</span>
          <Inline text={blocks[i + 1].text ?? ""} />
        </p>,
      );
      i++;
      continue;
    }

    const lead = !leadDone && b.t === "p" && plain(b.text ?? "").length > 60;
    if (lead) leadDone = true;
    nodes.push(
      <p key={key} className={lead ? "ix-lead read my-4 max-w-4xl" : "read my-4 max-w-4xl text-[1.08rem] leading-[1.7] text-[var(--text-muted)]"}>
        <Inline text={b.text ?? ""} />
      </p>,
    );
  }
  return <div className="min-w-0">{nodes}</div>;
}

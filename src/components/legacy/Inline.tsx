import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight, FileText } from "lucide-react";

const TOKEN = /\*\*([^*]+)\*\*|\[([^\]]*)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g;
const FILE = /\.(pdf|docx?|xlsx?|pptx?|zip|rar)(\?|$)/i;

export const linkClass =
  "font-semibold text-[var(--fg-lime-400)] underline decoration-[rgba(216,181,88,0.45)] underline-offset-[3px] transition-colors hover:text-[var(--text)] hover:decoration-[var(--fg-lime-400)]";

export function Inline({ text }: { text: string }) {
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
          <Inline text={m[1]} />
        </strong>,
      );
      continue;
    }
    const [, , label, href] = m;
    const external = !href.startsWith("/");
    out.push(
      external ? (
        <a key={`a${i++}`} href={href} target="_blank" rel="noopener noreferrer" className={linkClass}>
          {label ? <Inline text={label} /> : href}
          {FILE.test(href) ? (
            <FileText size={13} aria-hidden className="ml-1 inline -translate-y-px" />
          ) : (
            <ArrowUpRight size={13} aria-hidden className="ml-0.5 inline -translate-y-px" />
          )}
        </a>
      ) : (
        <Link key={`a${i++}`} href={href} className={linkClass}>
          {label ? <Inline text={label} /> : href}
        </Link>
      ),
    );
  }
  pushText(text.slice(last));
  return <>{out}</>;
}

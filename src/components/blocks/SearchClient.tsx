"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { search } from "@/lib/search-index";

export function SearchClient({ initialQuery = "" }: { initialQuery?: string }) {
  const [q, setQ] = useState(initialQuery);
  const results = useMemo(() => search(q), [q]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative">
        <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-faint)]" />
        <Input
          id="global-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar noticias, publicaciones, eventos, páginas…"
          className="pl-10 py-3"
          autoFocus
        />
      </div>

      {q && (
        <p className="text-sm text-[var(--text-faint)]">
          {results.length} resultado{results.length !== 1 ? "s" : ""} para “{q}”
        </p>
      )}

      <div className="flex flex-col divide-y divide-[var(--border)]">
        {results.map((r) => (
          <Link key={r.href} href={r.href} className="py-4 flex flex-col gap-1 hover:bg-[var(--bg-muted)] -mx-2 px-2 rounded-[var(--radius-sm)] transition-colors">
            <div className="flex items-center gap-2">
              <Badge tone="neutral">{r.type}</Badge>
            </div>
            <span className="font-semibold text-[var(--text)]">{r.title}</span>
            <span className="text-sm text-[var(--text-muted)]">{r.excerpt}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

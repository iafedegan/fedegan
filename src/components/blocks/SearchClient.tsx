"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { search, type SearchResult } from "@/lib/search-index";

export function SearchClient({ initialQuery = "", index }: { initialQuery?: string; index: SearchResult[] }) {
  const [q, setQ] = useState(initialQuery);
  const results = useMemo(() => search(index, q), [index, q]);

  return (
    <div className="flex flex-col gap-8">
      <div className="relative">
        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--fg-lime-500)]" />
        <Input
          id="global-search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar noticias, publicaciones, eventos, páginas…"
          className="!rounded-full py-4 pl-14 pr-5 text-base"
          autoFocus
        />
      </div>

      {q && (
        <p className="text-sm text-[var(--text-faint)]">
          {results.length} resultado{results.length !== 1 ? "s" : ""} para “{q}”
        </p>
      )}

      <div className="flex flex-col gap-4">
        {results.map((r) => (
          <Link key={r.href} href={r.href} className="group block">
            <Card>
              <div className="flex flex-col gap-2 p-5 sm:p-6">
                <Badge tone="neutral" className="self-start">{r.type}</Badge>
                <span className="font-[var(--font-display)] text-lg font-bold text-[var(--text)] transition-colors group-hover:text-[var(--fg-lime-400)]">{r.title}</span>
                <span className="text-sm leading-relaxed text-[var(--text-muted)]">{r.excerpt}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { PhotoCard } from "@/components/ui/PhotoCard";
import { EmptyResults, FilterToolbar } from "@/components/ui/FilterToolbar";

export interface PublicationItem {
  slug: string;
  type: string;
  title: string;
  dek: string;
  image: string;
  pos: string;
  accent: string;
}

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

export function PublicationsExplorer({ items }: { items: PublicationItem[] }) {
  const [type, setType] = useState("all");
  const [query, setQuery] = useState("");

  const options = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((i) => counts.set(i.type, (counts.get(i.type) ?? 0) + 1));
    return [{ value: "all", label: "Todas", count: items.length }, ...[...counts].map(([value, count]) => ({ value, label: value, count }))];
  }, [items]);

  const shown = useMemo(() => {
    const q = norm(query.trim());
    return items.filter((i) => (type === "all" || i.type === type) && (!q || norm(`${i.title} ${i.dek} ${i.type}`).includes(q)));
  }, [items, type, query]);

  const reset = () => {
    setType("all");
    setQuery("");
  };

  return (
    <>
      <FilterToolbar
        options={options}
        value={type}
        onChange={setType}
        query={query}
        onQuery={setQuery}
        placeholder="Buscar publicaciones…"
        searchLabel="Buscar publicaciones"
        summary={`${shown.length} de ${items.length} publicaciones`}
      />
      {shown.length === 0 ? (
        <EmptyResults onReset={reset}>No encontramos publicaciones con esa búsqueda.</EmptyResults>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((p) => (
            <PhotoCard
              key={p.slug}
              image={p.image}
              imagePos={p.pos}
              accent={p.accent}
              kicker={p.type}
              title={p.title}
              text={p.dek}
              href={`/publicaciones/${p.slug}`}
              cta="Ver publicación"
              badge={<Badge tone="lime">{p.type}</Badge>}
            />
          ))}
        </div>
      )}
    </>
  );
}

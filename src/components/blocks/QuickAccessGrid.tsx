import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { Badge } from "@/components/ui/Badge";
import { quickAccess } from "@/content/site";
import { iconMap } from "@/components/ui/icon-map";

export function QuickAccessGrid() {
  return (
    <section className="-mt-8 relative z-10">
      <Container>
        <div className="bg-white rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-md)] grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-[var(--border)]">
          {quickAccess.map((item) => {
            const Icon = iconMap[item.icon];
            return (
              <Link
                key={item.href}
                href={item.href}
                target={item.external ? "_blank" : undefined}
                className="group flex flex-col gap-2 p-5 hover:bg-[var(--bg-muted)] transition-colors relative"
              >
                {item.comingSoon && (
                  <Badge tone="lime" className="absolute top-3 right-3">
                    Próximamente
                  </Badge>
                )}
                <span className="w-10 h-10 rounded-[var(--radius-sm)] bg-[var(--bg-muted)] text-[var(--fg-green-700)] flex items-center justify-center group-hover:bg-[var(--fg-green-700)] group-hover:text-white transition-colors">
                  <Icon size={20} />
                </span>
                <span className="font-bold text-sm text-[var(--text)]">{item.label}</span>
                <span className="text-xs text-[var(--text-muted)] leading-snug">{item.description}</span>
                <span className="mt-auto pt-1 text-[var(--fg-green-700)] opacity-0 group-hover:opacity-100 transition-opacity">
                  <ArrowRight size={15} />
                </span>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}

"use client";

import { useReportWebVitals } from "next/web-vitals";
import { getConsent } from "@/lib/uso";

// Mide LCP, INP, CLS, FCP y TTFB de visitantes reales y las envía a /api/vitals (y al dataLayer de GTM si existe).
export function WebVitals() {
  useReportWebVitals((m) => {
    if (getConsent() !== true) return;
    const body = JSON.stringify({ name: m.name, value: m.value, rating: m.rating, path: location.pathname });
    navigator.sendBeacon?.("/api/vitals", body);
    window.dataLayer?.push({ event: "web_vitals", vitals_name: m.name, vitals_value: Math.round(m.value), vitals_rating: m.rating });
  });
  return null;
}

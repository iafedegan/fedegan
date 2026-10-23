"use client";

import { useEffect } from "react";
import { EVENTO_USO, getConsent } from "@/lib/uso";

const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID;

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

// Google Tag Manager (que a su vez despliega GA4) se inyecta solo con consentimiento; si la persona lo
// retira, no se vuelve a cargar en la siguiente visita.
export function Analytics() {
  useEffect(() => {
    if (!GTM_ID) return;
    const cargar = () => {
      if (getConsent() !== true || document.getElementById("gtm-script")) return;
      window.dataLayer = window.dataLayer ?? [];
      window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      const s = document.createElement("script");
      s.id = "gtm-script";
      s.async = true;
      s.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`;
      document.head.appendChild(s);
    };
    cargar();
    window.addEventListener(EVENTO_USO, cargar);
    return () => window.removeEventListener(EVENTO_USO, cargar);
  }, []);
  return null;
}

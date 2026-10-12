"use server";

import { updateTag } from "next/cache";
import { getEditor } from "@/lib/cms/guard";
import { CMS_TAG } from "@/lib/cms/client";
import { normalizeDesign, type DesignConfig } from "./regions";
import { publish, restorePrevious, saveDraft } from "./store";

export type DesignResult = { error?: string; design?: DesignConfig };

async function actor() {
  const ed = await getEditor();
  return ed?.actor ?? null;
}

export async function saveDesignDraft(raw: unknown): Promise<DesignResult> {
  const a = await actor();
  if (!a) return { error: "Sin permiso para editar el diseño." };
  const design = normalizeDesign(raw);
  const err = await saveDraft(a, design);
  return err ? { error: err } : { design };
}

export async function publishDesign(raw: unknown): Promise<DesignResult> {
  const a = await actor();
  if (!a) return { error: "Sin permiso para publicar el diseño." };
  const design = normalizeDesign(raw);
  const err = await publish(a, design);
  if (err) return { error: err };
  updateTag(CMS_TAG);
  return { design };
}

export async function undoDesignPublish(): Promise<DesignResult> {
  const a = await actor();
  if (!a) return { error: "Sin permiso para editar el diseño." };
  const r = await restorePrevious(a);
  if (r.error || !r.design) return { error: r.error ?? "No se pudo deshacer." };
  updateTag(CMS_TAG);
  return { design: r.design };
}

import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { credencialIA, PROVEEDORES } from "@/lib/ia";

// Llamada al modelo que comparten el asistente del curso y el Studio. Usa la clave que se guarda en Conexiones (o la variable de
// entorno): Claude si la tiene y, si no, Gemini. Para leer el video de una lección solo sirve Gemini.

const MODELO_CLAUDE = process.env.CLAUDE_ASSISTANT_MODEL ?? "claude-sonnet-5-5";
export type Prov = { p: "claude" | "gemini"; key: string };

/** Proveedor con clave. `preferir: "gemini"` lo pone primero (el Studio lee el video de cada lección, y eso solo lo hace Gemini). */
export async function proveedorActivo(preferir?: "claude" | "gemini"): Promise<Prov | null> {
  const orden = preferir === "gemini" ? (["gemini", "claude"] as const) : (["claude", "gemini"] as const);
  for (const p of orden) {
    const { key } = await credencialIA(p);
    if (key) return { p, key };
  }
  return null;
}

export const SYSTEM = `Eres el asistente de estudio de la Escuela Virtual de FEDEGÁN–FNG, como un cuaderno de estudio del curso.
Reglas:
- Responde SIEMPRE en español sencillo, claro y cercano, pensando en productores, técnicos y estudiantes del campo colombiano.
- Basa tus respuestas ÚNICAMENTE en las FUENTES del curso que se te dan (el video de la lección actual, si viene adjunto, y los textos de las lecciones). No uses conocimiento externo para afirmar datos, dosis, cifras o normas.
- Si lo que preguntan no está en las fuentes, dilo con honestidad ("Eso no se trata en este curso") y sugiere la lección o el tema más cercano.
- Cita de dónde sale cada idea con el formato [Lección N: título].
- Sé breve y ordenado: usa listas cortas. No inventes información médica o veterinaria; ante casos de animales enfermos recomienda consultar a un médico veterinario.
- Si piden preguntas de práctica, hazlas de selección múltiple y da las respuestas al final.`;

export function isYouTube(url: string | null) {
  return !!url && /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(url);
}

export type Turno = { role: "user" | "model"; text: string };
export type Pedido = { text: string; history?: Turno[]; video?: string | null; json?: boolean; tokens?: number; system?: string; timeoutMs?: number; /** Si el proveedor rechaza el pedido, lanza un error con su motivo en vez de devolver null (lo usa el Studio para decir por qué falló). */ detalle?: boolean };

/** Respuesta del modelo (null si el proveedor no pudo responder). El video de la lección solo lo lee Gemini; Claude trabaja con los textos. */
export async function generar(prov: Prov, q: Pedido): Promise<string | null> {
  const system = q.system ?? SYSTEM;
  const timeout = q.timeoutMs ?? 90_000;
  if (prov.p === "claude") {
    const client = new Anthropic({ apiKey: prov.key, timeout, maxRetries: 1 });
    const turnos = (q.history ?? []).map((t) => ({ role: t.role === "model" ? ("assistant" as const) : ("user" as const), content: t.text }));
    while (turnos.length && turnos[0].role === "assistant") turnos.shift();
    const res = await client.messages.create({ model: MODELO_CLAUDE, max_tokens: q.tokens ?? 1500, system, messages: [...turnos, { role: "user", content: q.text }] });
    const texto = res.content.map((b) => (b.type === "text" ? b.text : "")).join("").trim();
    // A veces envuelve el JSON en un bloque de código aunque se le pida que no.
    return (q.json ? texto.replace(/^```[a-z]*\n([\s\S]*?)\n```$/i, "$1").trim() : texto) || null;
  }
  const parts: Record<string, unknown>[] = [];
  if (q.video) parts.push({ fileData: { fileUri: q.video, mimeType: "video/*" } });
  parts.push({ text: q.text });
  const history = (q.history ?? []).map((t) => ({ role: t.role, parts: [{ text: t.text }] }));
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${PROVEEDORES.gemini.modelo}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": prov.key },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: system }] }, contents: [...history, { role: "user", parts }], generationConfig: { temperature: 0.3, maxOutputTokens: q.tokens ?? 1500, ...(q.json ? { responseMimeType: "application/json" } : {}) } }),
    signal: AbortSignal.timeout(timeout),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (q.detalle) throw new Error(String(data?.error?.message ?? `HTTP ${res.status}`).slice(0, 200));
    return null;
  }
  return (data.candidates?.[0]?.content?.parts ?? []).map((p: { text?: string }) => p.text ?? "").join("").trim() || null;
}

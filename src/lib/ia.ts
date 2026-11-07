import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { ApiError, FinishReason, GoogleGenAI } from "@google/genai";
import { getStoredSecret } from "@/lib/cms/integrations";

// Redacción de páginas con IA (Claude o Gemini) desde el árbol del sitio.
// La guía de estilo va como instrucción de sistema en cada pedido, para que el texto salga con la voz
// y el formato del portal; los colores y fuentes los pone el sitio solo, porque la IA escribe en el mismo
// formato de texto que el editor (## títulos, listas, negrita, enlaces).

export type Proveedor = "claude" | "gemini";

export const PROVEEDORES: Record<Proveedor, { label: string; modelo: string; env: string[] }> = {
  claude: { label: "Claude (Anthropic)", modelo: "claude-opus-5-5", env: ["ANTHROPIC_API_KEY"] },
  gemini: { label: "Gemini (Google)", modelo: process.env.GEMINI_MODEL || "gemini-3.8-flash", env: ["GEMINI_API_KEY", "GOOGLE_API_KEY"] },
};

export const GUIA_ESTILO = `Usted redacta páginas del portal web de FEDEGÁN (Federación Colombiana de Ganaderos), que también administra el FNG (Fondo Nacional del Ganado). Los lectores son ganaderos de todo el país, gremios, periodistas, entidades públicas y estudiantes.

Voz y tono
- Español de Colombia, institucional pero cercano. Trate al lector de «usted».
- Frases claras y párrafos cortos (dos a cuatro oraciones). Voz activa. Sin adjetivos de relleno, sin tono publicitario, sin emojis ni signos de exclamación.
- Explique primero lo que el lector necesita saber o hacer; los antecedentes van después.

Formato (el portal solo entiende esto; los colores, fuentes y tamaños los aplica el sitio automáticamente)
- Párrafos separados por una línea en blanco.
- "## Título" para secciones, "### Subtítulo" y "#### Detalle" para niveles menores. No use "# " (el título principal ya lo muestra la página).
- "- elemento" para listas, un elemento por línea.
- **negrita** para resaltar pocas palabras; [texto](https://enlace) o [texto](/ruta) para enlaces.
- "@video https://…" en una línea sola para incrustar un video, documento o tablero, solo si el pedido trae esa dirección.
- "@boton Texto | https://… (o /ruta)" en una línea sola crea un botón con enlace. "@subir Texto" en una línea sola crea un botón para que el visitante cargue documentos (ej.: "@subir Cargar documentos"). Úselos cuando el pedido pida botones; nunca invente la dirección de un botón.
- Si una línea de párrafo debe empezar con #, -, @video, @boton, @subir, {{ o \\, ponga una barra invertida \\ delante.
- No use HTML, CSS, tablas, imágenes, bloques de código, comillas de cita (>), listas numeradas con "1." ni separadores (---).

Estructura sugerida
- Un párrafo de entrada que diga de qué trata la página y para quién es.
- Dos a seis secciones con "##", según lo que pida el editor (por ejemplo: qué es, a quién va dirigido, requisitos, cómo hacer el trámite, fechas, contacto).
- Si hay pasos, use una lista. Cierre con a quién contactar o a dónde ir, si aplica.

Datos
- No invente cifras, fechas, nombres de personas, teléfonos, correos, direcciones, normas ni enlaces. Use solo lo que traiga el pedido o el texto actual.
- Cuando haga falta un dato que no tiene, deje un marcador entre corchetes para que el equipo lo complete, por ejemplo [completar: teléfono de la oficina regional].
- Rutas internas que sí existen y puede enlazar: /noticias, /pagos, /preguntas-frecuentes, /escuela-virtual, /quienes-somos, /eventos, /publicaciones, /buscador.

Respuesta
- Entregue solo el contenido de la página en ese formato, listo para pegar. Sin saludo, sin explicación y sin repetir el título de la página al comienzo.`;

export type PedidoPagina = { pedido: string; titulo: string; nombre: string; ruta: string; seccion: string; actual: string };
export type ResultadoIA = { ok: true; texto: string; aviso?: string } | { ok: false; message: string };

/** Clave de cada proveedor: la guardada en Conexiones o, si no hay, la variable de entorno. */
export async function credencialIA(p: Proveedor): Promise<{ key: string | undefined; source: "panel" | "env" | "none" }> {
  const stored = await getStoredSecret(p);
  if (stored) return { key: stored, source: "panel" };
  for (const name of PROVEEDORES[p].env) {
    const v = process.env[name];
    if (v) return { key: v, source: "env" };
  }
  return { key: undefined, source: "none" };
}

function mensajeUsuario(d: PedidoPagina): string {
  const partes = [
    `Página: ${d.titulo || d.nombre}`,
    `Nombre en el menú: ${d.nombre}`,
    `Sección del sitio: ${d.seccion}`,
    `Dirección en el portal: ${d.ruta}`,
  ];
  if (d.actual.trim()) partes.push(`Texto actual de la página (úselo como base; consérvelo salvo que el pedido diga otra cosa):\n<texto_actual>\n${d.actual.trim()}\n</texto_actual>`);
  partes.push(`Lo que pide el editor:\n<pedido>\n${d.pedido.trim()}\n</pedido>`);
  return partes.join("\n\n");
}

// Algunos modelos envuelven la respuesta en un bloque de código aunque se les pida que no.
const limpiar = (t: string) => t.trim().replace(/^```[a-z]*\n([\s\S]*?)\n```$/i, "$1").trim();

async function conClaude(key: string, d: PedidoPagina): Promise<ResultadoIA> {
  const client = new Anthropic({ apiKey: key, timeout: 240_000, maxRetries: 1 });
  try {
    // Si un filtro de seguridad rechaza el pedido, la API lo reintenta sola con otro modelo (fallbacks: "default").
    const res = await client.beta.messages.create({
      model: PROVEEDORES.claude.modelo,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "medium" },
      system: GUIA_ESTILO,
      messages: [{ role: "user", content: mensajeUsuario(d) }],
    });
    if (res.stop_reason === "refusal") return { ok: false, message: "Claude no quiso redactar este contenido. Reformule el pedido." };
    const texto = limpiar(res.content.map((b) => (b.type === "text" ? b.text : "")).join(""));
    if (!texto) return { ok: false, message: "Claude no devolvió texto. Intente de nuevo." };
    return { ok: true, texto, aviso: res.stop_reason === "max_tokens" ? "El texto quedó cortado por su extensión; revise el final." : undefined };
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return { ok: false, message: "Anthropic rechazó la clave. Revísela en Conexiones." };
    if (e instanceof Anthropic.RateLimitError) return { ok: false, message: "Anthropic limitó las consultas (429). Intente en un minuto." };
    if (e instanceof Anthropic.APIConnectionTimeoutError) return { ok: false, message: "Claude tardó demasiado. Pida una página más corta o intente de nuevo." };
    if (e instanceof Anthropic.APIError) return { ok: false, message: `Anthropic respondió con un error (${e.status ?? "sin estado"}).` };
    return { ok: false, message: "No hubo conexión con Anthropic." };
  }
}

async function conGemini(key: string, d: PedidoPagina): Promise<ResultadoIA> {
  const ai = new GoogleGenAI({ apiKey: key });
  try {
    const res = await ai.models.generateContent({
      model: PROVEEDORES.gemini.modelo,
      contents: mensajeUsuario(d),
      config: { systemInstruction: GUIA_ESTILO, maxOutputTokens: 16000, abortSignal: AbortSignal.timeout(240_000) },
    });
    const fin = res.candidates?.[0]?.finishReason;
    if (fin === FinishReason.SAFETY) return { ok: false, message: "Gemini bloqueó este contenido por seguridad. Reformule el pedido." };
    const texto = limpiar(res.text ?? "");
    if (!texto) return { ok: false, message: "Gemini no devolvió texto. Intente de nuevo." };
    return { ok: true, texto, aviso: fin === FinishReason.MAX_TOKENS ? "El texto quedó cortado por su extensión; revise el final." : undefined };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.status === 400 || e.status === 401 || e.status === 403) return { ok: false, message: `Google rechazó la clave o el modelo «${PROVEEDORES.gemini.modelo}» (${e.status}). Revísela en Conexiones.` };
      if (e.status === 429) return { ok: false, message: "Google limitó las consultas (429). Intente en un minuto." };
      return { ok: false, message: `Google respondió con un error (${e.status}).` };
    }
    if (e instanceof Error && e.name === "TimeoutError") return { ok: false, message: "Gemini tardó demasiado. Pida una página más corta o intente de nuevo." };
    return { ok: false, message: "No hubo conexión con Google." };
  }
}

export async function redactarPagina(p: Proveedor, d: PedidoPagina): Promise<ResultadoIA> {
  const { key } = await credencialIA(p);
  if (!key) return { ok: false, message: `No hay clave de ${PROVEEDORES[p].label}. Cárguela en Panel → Conexiones.` };
  return p === "claude" ? conClaude(key, d) : conGemini(key, d);
}

/** Prueba una clave sin generar texto (consulta el modelo configurado). */
export async function probarClaveIA(p: Proveedor, key: string): Promise<{ ok: boolean; message: string }> {
  const t0 = Date.now();
  try {
    if (p === "claude") {
      await new Anthropic({ apiKey: key, timeout: 15_000, maxRetries: 0 }).models.retrieve(PROVEEDORES.claude.modelo);
    } else {
      await new GoogleGenAI({ apiKey: key }).models.get({ model: PROVEEDORES.gemini.modelo });
    }
    return { ok: true, message: `Conectada · modelo ${PROVEEDORES[p].modelo} · ${Date.now() - t0} ms` };
  } catch (e) {
    if (e instanceof Anthropic.AuthenticationError || e instanceof Anthropic.PermissionDeniedError) return { ok: false, message: "Anthropic rechazó la clave." };
    if (e instanceof Anthropic.NotFoundError) return { ok: false, message: `La clave sirve, pero no tiene acceso al modelo ${PROVEEDORES.claude.modelo}.` };
    if (e instanceof Anthropic.APIError) return { ok: false, message: `Anthropic respondió con el estado ${e.status ?? "desconocido"}.` };
    if (e instanceof ApiError) {
      if (e.status === 404) return { ok: false, message: `La clave sirve, pero el modelo «${PROVEEDORES.gemini.modelo}» no existe. Ajuste GEMINI_MODEL.` };
      return { ok: false, message: e.status === 400 || e.status === 401 || e.status === 403 ? "Google rechazó la clave." : `Google respondió con el estado ${e.status}.` };
    }
    return { ok: false, message: "No hubo conexión con el proveedor." };
  }
}

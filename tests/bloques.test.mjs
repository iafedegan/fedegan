import test from "node:test";
import assert from "node:assert/strict";
import {
  aBloques, aElementos, elementoNuevo, normalizarUrl, normalizarVideo, problema, sanearBloques, PLANTILLAS,
} from "../src/lib/cms/bloques.ts";

test("las páginas escritas antes (párrafos, títulos, listas) vuelven a guardarse igual", () => {
  const guardado = [
    { t: "h2", text: "Programas" },
    { t: "p", text: "Texto con **negrita** y [enlace](/pagos)." },
    { t: "li", text: "Uno" },
    { t: "li", text: "Dos" },
    { t: "embed", text: "https://www.youtube.com/embed/abc" },
  ];
  const elementos = aElementos(guardado);
  assert.equal(elementos.length, 4); // las dos viñetas son una sola lista
  assert.equal(elementos[2].tipo, "lista");
  assert.deepEqual(aBloques(elementos), guardado);
});

test("el botón que guardaba «texto|enlace» se lee y se vuelve a guardar con el enlace aparte", () => {
  const [el] = aElementos([{ t: "button", text: "Ir a pagos|/pagos" }]);
  assert.equal(el.tipo, "button");
  assert.equal(el.texto, "Ir a pagos");
  assert.equal(el.href, "/pagos");
  assert.deepEqual(aBloques([el]), [{ t: "button", text: "Ir a pagos", data: { href: "/pagos", estilo: "solido" } }]);
});

test("un elemento a medias no se publica y dice qué le falta", () => {
  const boton = { ...elementoNuevo("button"), texto: "Inscribirme" };
  assert.match(problema(boton), /enlace/i);
  assert.deepEqual(aBloques([boton]), []);
  assert.deepEqual(aBloques([elementoNuevo("p"), elementoNuevo("cards")]), []);
  assert.ok(problema(elementoNuevo("p")));
});

test("completa «fedegan.org.co» y los correos, y convierte los enlaces de YouTube", () => {
  assert.equal(normalizarUrl("fedegan.org.co/pagos"), "https://fedegan.org.co/pagos");
  assert.equal(normalizarUrl("alguien@fedegan.org.co"), "mailto:alguien@fedegan.org.co");
  assert.equal(normalizarUrl("/pagos"), "/pagos");
  assert.equal(normalizarVideo("https://www.youtube.com/watch?v=abc123"), "https://www.youtube.com/embed/abc123");
  assert.equal(normalizarVideo("https://youtu.be/abc123"), "https://www.youtube.com/embed/abc123");
});

test("el servidor rechaza enlaces peligrosos en botones, tarjetas, imágenes y documentos", () => {
  const malos = [
    { t: "button", text: "Hola", data: { href: "javascript:alert(1)" } },
    { t: "button", text: "Hola", data: { href: "//evil.example" } },
    { t: "cards", data: { items: [{ titulo: "A", enlace: "data:text/html,<script>" }] } },
    { t: "image", data: { src: "http://inseguro.example/a.png" } },
    { t: "docs", data: { items: [{ nombre: "Doc", url: "javascript:void(0)" }] } },
    { t: "embed", text: "http://inseguro.example" },
  ];
  for (const b of malos) assert.equal(sanearBloques([b]).ok, false, JSON.stringify(b));
});

test("el servidor limpia lo que llega: recorta textos, descarta lo vacío y no acepta tipos desconocidos", () => {
  const r = sanearBloques([
    { t: "p", text: "  Hola  " },
    { t: "p", text: "   " },
    { t: "cards", data: { columnas: 9, items: [{ titulo: "  Uno ", texto: "x", imagen: "", enlace: "fedegan.org.co", boton: "" }, {}] } },
    { t: "script", text: "x" },
  ]);
  assert.equal(r.ok, false);
  assert.match(r.message, /Elemento 4/);

  const ok = sanearBloques([
    { t: "p", text: "  Hola  " },
    { t: "p", text: "   " },
    { t: "cards", data: { columnas: 9, items: [{ titulo: "  Uno ", texto: "x", imagen: "", enlace: "fedegan.org.co", boton: "" }, {}] } },
  ]);
  assert.equal(ok.ok, true);
  assert.deepEqual(ok.bloques[0], { t: "p", text: "Hola" });
  assert.equal(ok.bloques[1].data.columnas, 3);
  assert.equal(ok.bloques[1].data.items.length, 1);
  assert.equal(ok.bloques[1].data.items[0].enlace, "https://fedegan.org.co");
});

test("no es una lista de bloques", () => {
  assert.equal(sanearBloques({ t: "p" }).ok, false);
  assert.equal(sanearBloques("x").ok, false);
  assert.equal(sanearBloques([null]).ok, false);
  assert.equal(sanearBloques(Array.from({ length: 401 }, () => ({ t: "divider" }))).ok, false);
});

test("cada plantilla se publica sin errores, salvo lo que el editor debe completar", () => {
  for (const p of PLANTILLAS) {
    const els = p.crear();
    assert.ok(els.length > 0);
    const r = sanearBloques(aBloques(els));
    assert.equal(r.ok, true, p.id);
  }
});

test("un bloque copiado que el constructor no edita (tabla) se conserva", () => {
  const tabla = { t: "table", rows: [["a", "b"], ["c", "d"]] };
  const [el] = aElementos([tabla]);
  assert.equal(el.tipo, "otro");
  assert.deepEqual(aBloques([el]), [tabla]);
  assert.deepEqual(sanearBloques([tabla]).bloques, [tabla]);
});

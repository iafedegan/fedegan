import test from "node:test";
import assert from "node:assert/strict";
import { docDe, nombreConTipo, tarjetasDeEnlaces, tarjetasDeTextos, tipoDeUrl } from "../src/lib/cms/documentos-tarjetas.ts";

const xlsx = "https://storage.googleapis.com/static-fedegan/SIG/Tasa-1.xlsx";
const pdf = "https://storage.googleapis.com/static-fedegan/SIG/Tasa-1.pdf";

test("el tipo sale de la extensión de la dirección", () => {
  assert.equal(tipoDeUrl(xlsx).nombre, "Excel");
  assert.equal(tipoDeUrl(`${pdf}?v=2`).sigla, "PDF");
  assert.equal(tipoDeUrl("/documentos/acta.docx").nombre, "Word");
  assert.equal(tipoDeUrl("https://example.com/pagina"), null);
  assert.equal(tipoDeUrl("no es una dirección"), null);
});

test("el tipo entre paréntesis y la etiqueta no son parte del nombre", () => {
  const d = docDe("Tasa de Imputación — Instructivo (PDF)", pdf);
  assert.equal(d.nombre, "Tasa de Imputación");
  assert.equal(d.etiqueta, "Instructivo");
  assert.equal(nombreConTipo("Tasa de imputación", xlsx), "Tasa de imputación (Excel)");
  assert.equal(nombreConTipo("Tasa de imputación (Excel)", xlsx), "Tasa de imputación (Excel)");
  assert.equal(nombreConTipo("Sin tipo conocido", "https://example.com/x"), "Sin tipo conocido");
});

test("una lista de viñetas solo se vuelve tarjetas si todas son documentos (aunque sea uno solo)", () => {
  const li = (n, u) => `[${n}](${u})`;
  assert.equal(tarjetasDeTextos([li("Uno (Excel)", xlsx)]).length, 1);
  assert.equal(tarjetasDeTextos([li("Uno", "https://example.com/pagina")]), null);
  assert.equal(tarjetasDeTextos([li("Uno (Excel)", xlsx), "Un texto cualquiera"]), null);
  assert.equal(tarjetasDeTextos([li("Uno", "https://example.com/pagina"), li("Dos", pdf)]), null);
  const t = tarjetasDeTextos([li("Uno (Excel)", xlsx), li("Dos (PDF)", pdf)]);
  assert.equal(t.length, 2);
});

test("el Excel y el PDF con el mismo nombre, seguidos, van en la misma tarjeta", () => {
  const t = tarjetasDeTextos([`[Tasa (Excel)](${xlsx})`, `[Tasa (PDF)](${pdf})`, `[Otra (Excel)](https://example.com/otra.xlsx)`]);
  assert.equal(t.length, 2);
  assert.equal(t[0].titulo, "Tasa");
  assert.deepEqual(t[0].docs.map((d) => d.tipo.sigla), ["XLS", "PDF"]);
});

test("el elemento «Documentos» muestra tarjetas aunque tenga un solo archivo", () => {
  const t = tarjetasDeEnlaces([{ nombre: "Acta de junio", url: pdf }]);
  assert.equal(t.length, 1);
  assert.equal(t[0].docs[0].tipo.nombre, "PDF");
  assert.equal(tarjetasDeEnlaces([]), null);
  assert.equal(tarjetasDeEnlaces([{ nombre: "Sitio", url: "https://example.com/inicio" }]), null);
  assert.equal(tarjetasDeEnlaces([{ nombre: "Acta", url: "/documentos/acta.pdf" }]).length, 1, "también con rutas del portal");
});

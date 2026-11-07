import test from "node:test";
import assert from "node:assert/strict";
import { aBloques, aElementos, elementoNuevo, problema, sanearBloques, CATALOGO, NOMBRE_TIPO } from "../src/lib/cms/bloques.ts";
import { ESQUEMAS, GRUPOS, TIPOS_ESQUEMA, datosIniciales, esquemaDe, leerDatos, limpiarDatos } from "../src/lib/cms/elementos.ts";

const con = (tipo, datos) => {
  const el = elementoNuevo(tipo);
  return { ...el, datos: { ...el.datos, ...datos } };
};

test("hay muchos elementos y cada uno tiene su lugar en la paleta", () => {
  assert.ok(TIPOS_ESQUEMA.length >= 20);
  assert.ok(CATALOGO.length >= 34);
  const tipos = CATALOGO.map((c) => c.tipo);
  assert.equal(new Set(tipos).size, tipos.length, "sin tipos repetidos");
  for (const c of CATALOGO) assert.ok(GRUPOS.includes(c.grupo), c.tipo);
  for (const t of TIPOS_ESQUEMA) assert.ok(tipos.includes(t), t);
  // La paleta va ordenada por grupos.
  const indices = CATALOGO.map((c) => GRUPOS.indexOf(c.grupo));
  assert.deepEqual(indices, [...indices].sort((a, b) => a - b));
  for (const t of TIPOS_ESQUEMA) assert.equal(NOMBRE_TIPO[t], ESQUEMAS[t].nombre);
});

test("un elemento recién añadido está vacío: no se publica y dice qué escribir (salvo el espacio)", () => {
  for (const t of TIPOS_ESQUEMA) {
    const el = elementoNuevo(t);
    if (ESQUEMAS[t].siempre) {
      assert.equal(problema(el), null, t);
      assert.equal(aBloques([el]).length, 1, t);
    } else {
      assert.ok(problema(el), t);
      assert.deepEqual(aBloques([el]), [], t);
    }
  }
});

test("los datos válidos se publican, pasan por el servidor y vuelven iguales al editor", () => {
  const casos = [
    con("aviso", { tono: "alerta", titulo: "Atención", texto: "El plazo vence el **30 de mayo**." }),
    con("cita", { texto: "El campo es futuro.", autor: "José Félix Lafaurie", cargo: "Presidente ejecutivo" }),
    con("columnas", { columnas: "3", items: [{ titulo: "Uno", texto: "a" }, { titulo: "Dos", texto: "b" }, { titulo: "Tres", texto: "c" }] }),
    con("botones", { alineacion: "centro", items: [{ texto: "Pagar", enlace: "/pagos", estilo: "solido" }, { texto: "Guía", enlace: "https://fedegan.org.co/guia.pdf", estilo: "borde" }] }),
    con("banner", { imagen: "https://example.com/a.jpg", titulo: "Vacunación", boton: "Ver ciclos", enlace: "/programas" }),
    con("redes", { items: [{ red: "instagram", enlace: "https://instagram.com/fedegan" }] }),
    con("imagentexto", { imagen: "https://example.com/a.jpg", titulo: "Sobre nosotros", texto: "Texto" }),
    con("galeria", { items: [{ imagen: "https://example.com/1.jpg", pie: "Uno" }, { imagen: "https://example.com/2.jpg", pie: "" }] }),
    con("audio", { titulo: "Boletín", url: "https://example.com/boletin.mp3" }),
    con("logos", { items: [{ imagen: "https://example.com/logo.png", nombre: "Aliado", enlace: "https://example.com" }] }),
    con("pestanas", { items: [{ titulo: "Requisitos", texto: "Cédula" }, { titulo: "Costos", texto: "Gratis" }] }),
    con("cifras", { items: [{ valor: "27,5 M", etiqueta: "bovinos", nota: "DANE" }] }),
    con("pasos", { items: [{ titulo: "Ingrese", texto: "" }, { titulo: "Pague", texto: "con PSE" }] }),
    con("cronologia", { estilo: "fechas", items: [{ fecha: "15 de mayo", titulo: "Cierre", texto: "" }] }),
    con("caracteristicas", { items: [{ icono: "res", titulo: "Sanidad", texto: "Vacunación" }] }),
    con("enlaces", { items: [{ titulo: "Zona de pagos", texto: "Cuota de fomento", enlace: "/pagos" }] }),
    con("tabla", { titulo: "Cuota", encabezado: true, filas: [["Producto", "Valor"], ["Leche", "0,5 %"]] }),
    con("personas", { items: [{ foto: "", nombre: "Ana Pérez", cargo: "Directora", correo: "ana@fedegan.org.co", telefono: "(601) 578 2020" }] }),
    con("contacto", { titulo: "Atención al ganadero", telefono: "+57 601 578 2020", correo: "pqrsd@fedegan.org.co", direccion: "Calle 37 N.º 14-31, Bogotá", horario: "Lunes a viernes" }),
    elementoNuevo("espaciador"),
  ];
  for (const el of casos) {
    assert.equal(problema(el), null, `${el.tipo}: ${problema(el)}`);
    const guardado = aBloques([el]);
    assert.equal(guardado.length, 1, el.tipo);
    assert.equal(guardado[0].t, el.tipo);
    const servidor = sanearBloques(guardado);
    assert.equal(servidor.ok, true, `${el.tipo}: ${servidor.message}`);
    assert.deepEqual(servidor.bloques, guardado, el.tipo);
    // Al volver a abrir la página, el editor recibe los mismos datos.
    const [vuelve] = aElementos(guardado);
    assert.equal(vuelve.tipo, el.tipo);
    assert.deepEqual(aBloques([vuelve]), guardado, el.tipo);
  }
});

test("el servidor rechaza enlaces, imágenes, correos y teléfonos que no son válidos", () => {
  const malos = [
    con("botones", { items: [{ texto: "Hola", enlace: "javascript:alert(1)", estilo: "solido" }] }),
    con("botones", { items: [{ texto: "Hola", enlace: "//evil.example", estilo: "solido" }] }),
    con("banner", { titulo: "Hola", imagen: "http://inseguro.example/a.jpg" }),
    con("galeria", { items: [{ imagen: "data:image/png;base64,AAAA", pie: "" }] }),
    con("audio", { titulo: "x", url: "javascript:void(0)" }),
    con("enlaces", { items: [{ titulo: "x", texto: "", enlace: "vbscript:x" }] }),
    con("contacto", { titulo: "Oficina", correo: "no es un correo" }),
    con("personas", { items: [{ foto: "", nombre: "Ana", cargo: "", correo: "", telefono: "<script>" }] }),
  ];
  for (const el of malos) {
    assert.ok(problema(el) || aBloques([el]).length === 0, `${el.tipo} debería tener un problema`);
    const crudo = { t: el.tipo, data: el.datos };
    assert.equal(sanearBloques([crudo]).ok, false, JSON.stringify(crudo));
  }
});

test("un botón sin enlace (o un enlace sin botón) en un banner se avisa", () => {
  assert.match(problema(con("banner", { titulo: "Hola", boton: "Ir" })), /enlace/i);
  assert.match(problema(con("banner", { titulo: "Hola", enlace: "/pagos" })), /botón/i);
  assert.match(problema(con("imagentexto", { imagen: "https://example.com/a.jpg", boton: "Ir" })), /enlace/i);
});

test("las partes incompletas dicen cuál falta", () => {
  assert.match(problema(con("galeria", { items: [{ imagen: "", pie: "Sin foto" }] })), /Foto 1: Falta «Foto»/);
  assert.match(problema(con("cifras", { items: [{ valor: "", etiqueta: "bovinos", nota: "" }] })), /Cifra 1: Falta «Cifra»/);
  assert.match(problema(con("pestanas", { items: [{ titulo: "", texto: "algo" }] })), /Pestaña 1: Falta «Título de la pestaña»/);
});

test("el servidor limpia: recorta, acota las listas, descarta partes vacías y corrige opciones", () => {
  const esq = ESQUEMAS.galeria;
  const muchas = Array.from({ length: 45 }, (_, i) => ({ imagen: `https://example.com/${i}.jpg`, pie: `  pie ${i}  ` }));
  const d = limpiarDatos(esq, { columnas: "9", items: [...muchas, { imagen: "", pie: "" }] });
  assert.equal(d.items.length, 30);
  assert.equal(d.items[0].pie, "pie 0");
  assert.equal(d.columnas, "3", "una opción que no existe vuelve a la de siempre");
  assert.equal(limpiarDatos(esq, { items: [{ imagen: "", pie: "" }] }), null, "sin nada que publicar");
  assert.equal(limpiarDatos(ESQUEMAS.cita, { texto: "x".repeat(2000) }).texto.length, 700);
  assert.equal(limpiarDatos(ESQUEMAS.banner, { titulo: "Hola", enlace: "fedegan.org.co" }).enlace, "https://fedegan.org.co");
});

test("una tabla se limpia: quita filas y columnas vacías del final y queda rectangular", () => {
  const d = limpiarDatos(ESQUEMAS.tabla, { encabezado: true, filas: [["A", "B", "", ""], ["1", "", "", ""], ["", "", "", ""], ["", "", "", ""]] });
  assert.deepEqual(d.filas, [["A", "B"], ["1", ""]]);
  assert.equal(limpiarDatos(ESQUEMAS.tabla, { filas: [["", ""], ["", ""]] }), null);
  const enorme = limpiarDatos(ESQUEMAS.tabla, { filas: Array.from({ length: 100 }, () => Array.from({ length: 20 }, () => "x")) });
  assert.equal(enorme.filas.length, 40);
  assert.equal(enorme.filas[0].length, 8);
});

test("solo se reconocen los tipos del catálogo (nada de «constructor» ni «__proto__»)", () => {
  assert.equal(esquemaDe("constructor"), undefined);
  assert.equal(esquemaDe("__proto__"), undefined);
  assert.equal(esquemaDe("toString"), undefined);
  assert.ok(esquemaDe("aviso"));
  assert.equal(sanearBloques([{ t: "constructor", data: {} }]).ok, false);
  assert.equal(sanearBloques([{ t: "script", text: "x" }]).ok, false);
});

test("leer datos viejos o raros no rompe: toma los valores por omisión", () => {
  const d = leerDatos(ESQUEMAS.cifras, { columnas: 7, items: "no es una lista", extra: "se ignora" });
  assert.deepEqual(Object.keys(d).sort(), ["columnas", "items", "titulo"]);
  assert.deepEqual(d.items, []);
  assert.deepEqual(leerDatos(ESQUEMAS.aviso, null), datosIniciales(ESQUEMAS.aviso));
  const [el] = aElementos([{ t: "aviso", data: { tono: "no existe", texto: 5 } }]);
  assert.equal(el.datos.tono, "info");
  assert.equal(el.datos.texto, "");
});

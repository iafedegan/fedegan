import test from "node:test";
import assert from "node:assert/strict";
import { hostPublico, iframeDe, urlPermitida } from "../src/lib/estadisticas/url.ts";

test("un iframe pegado entrega su dirección o su contenido", () => {
  assert.deepEqual(iframeDe('<iframe src="https://estadisticas.fedegan.org.co/Indicadores/13" width="100%" height="900"></iframe>'), { src: "https://estadisticas.fedegan.org.co/Indicadores/13" });
  assert.deepEqual(iframeDe("<IFRAME frameborder='0' src='https://cifras.ejemplo.co/a?x=1&amp;y=2'></IFRAME>"), { src: "https://cifras.ejemplo.co/a?x=1&y=2" });
  assert.deepEqual(iframeDe('<iframe srcdoc="&lt;form name=&quot;doc1&quot;&gt;hola&lt;/form&gt;"></iframe>'), { srcdoc: '<form name="doc1">hola</form>' });
  assert.equal(iframeDe('<html><form name="doc1" id="doc1">…</form></html>'), null, "una página completa no es un iframe");
  assert.equal(iframeDe("<iframe></iframe>"), null);
});

test("solo se traen páginas https de sitios públicos", () => {
  for (const ok of ["https://estadisticas.fedegan.org.co/Indicadores/13", "https://cifras.ejemplo.co/x?y=1", "https://a.b.c.example.com:443/p"]) assert.ok(urlPermitida(ok), ok);
  for (const mal of ["http://estadisticas.fedegan.org.co/x", "https://localhost/x", "https://127.0.0.1/x", "https://10.0.0.5/x", "https://169.254.169.254/latest", "https://[::1]/x", "https://sitio.local/x", "https://intranet/x", "https://sitio.com:8443/x", "https://usuario:clave@sitio.com/x", "ftp://sitio.com/x", "no es una dirección"]) assert.equal(urlPermitida(mal), null, mal);
  assert.equal(hostPublico("fedegan.org.co"), true);
  assert.equal(hostPublico("192.168.1.10"), false);
});

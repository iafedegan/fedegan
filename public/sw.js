/* Service worker del portal FEDEGÁN–FNG: uso sin conexión.
   La versión llega en la URL (/sw.js?v=<build>) y renueva la caché en cada despliegue. */
const VERSION = new URL(self.location.href).searchParams.get("v") || "dev";
const PAGES = `fedegan-pages-${VERSION}`;
const ASSETS = `fedegan-assets-${VERSION}`;
const PRECACHE = ["/", "/offline", "/quienes-somos", "/servicios", "/contacto", "/preguntas-frecuentes", "/noticias", "/seccion/programas"];
const MAX_PAGES = 60;
const MAX_ASSETS = 120;

// Guarda los scripts, estilos y fuentes que una página referencia, para que funcione completa sin red.
async function cacheAssetsOf(html) {
  const found = new Set(html.match(/\/_next\/static\/[^"'\\\s)<>]+/g) || []);
  const cache = await caches.open(ASSETS);
  await Promise.allSettled([...found].slice(0, 80).map(async (u) => {
    if (await cache.match(u)) return;
    const res = await fetch(u);
    if (res.ok) await cache.put(u, res);
  }));
}

async function precachePage(cache, url) {
  const res = await fetch(new Request(url, { credentials: "same-origin" }));
  if (!res.ok) return;
  await cache.put(url, res.clone());
  await cacheAssetsOf(await res.text());
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(PAGES)
      .then((cache) => Promise.allSettled(PRECACHE.map((u) => precachePage(cache, u))))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("fedegan-") && k !== PAGES && k !== ASSETS).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

async function trim(name, max) {
  const cache = await caches.open(name);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - max; i++) await cache.delete(keys[i]);
}

const skip = (url) => /^\/(admin|api|ingresar|mi-fedegan)/.test(url.pathname);

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || skip(url)) return;

  // Documentos y datos de navegación: red primero; sin red, la copia guardada o la página sin conexión.
  if (req.mode === "navigate" || req.headers.get("RSC")) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(PAGES).then((c) => c.put(req, copy)).then(() => trim(PAGES, MAX_PAGES));
            if (req.mode === "navigate") res.clone().text().then(cacheAssetsOf).catch(() => {});
          }
          return res;
        })
        .catch(async () => {
          // Next responde con «Vary» (rsc, router-state…): se ignora para que la copia guardada coincida.
          const hit =
            (await caches.match(req, { ignoreVary: true })) ||
            (await caches.match(url.pathname, { ignoreVary: true })) ||
            (await caches.match(req, { ignoreVary: true, ignoreSearch: true }));
          if (hit) return hit;
          if (req.mode === "navigate") return (await caches.match("/offline")) || Response.error();
          return Response.error();
        }),
    );
    return;
  }

  // Recursos estáticos e imágenes: caché primero y se renueva en segundo plano.
  if (/^\/_next\/(static|image)/.test(url.pathname) || /\.(png|jpe?g|webp|avif|svg|ico|woff2?)$/.test(url.pathname)) {
    event.respondWith(
      caches.open(ASSETS).then(async (cache) => {
        const hit = await cache.match(req);
        const fresh = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone()).then(() => trim(ASSETS, MAX_ASSETS));
            return res;
          })
          .catch(() => hit);
        return hit || fresh;
      }),
    );
  }
});

/* Modo offline da página treino-05.html (Elizandra, Bloco 2).
   A página abre na hora com a cópia guardada no celular. Com internet, a versão nova
   é baixada em segundo plano e aparece na abertura seguinte.
   Este arquivo fica na mesma pasta do repositório que treino-05.html. */
const CACHE = "elizandra-bloco2-v1";
const PAGINA = new URL("treino-05.html", self.location).href;
const ICONE = new URL("icone-elizandra.png", self.location).href;

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then(async (c) => { await c.add(PAGINA); try { await c.add(ICONE); } catch (_) {} })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k.startsWith("elizandra-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  const ehPagina = req.mode === "navigate" || (url.origin === self.location.origin && url.pathname.endsWith("/treino-05.html"));
  const ehFonte = url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com";
  const ehIcone = url.origin + url.pathname === ICONE;
  if (!ehPagina && !ehFonte && !ehIcone) return;

  const chave = ehPagina ? PAGINA : req;
  e.respondWith(caches.open(CACHE).then(async (cache) => {
    const guardada = await cache.match(chave, { ignoreSearch: ehPagina || ehIcone });
    const daRede = fetch(req)
      .then((r) => { if (r && (r.ok || r.type === "opaque")) cache.put(chave, r.clone()); return r; })
      .catch(() => null);
    if (guardada) { e.waitUntil(daRede); return guardada; }
    const r = await daRede;
    return r || new Response("Sem internet e sem cópia guardada. Abra a página uma vez com internet.",
      { status: 503, headers: { "Content-Type": "text/plain; charset=utf-8" } });
  }));
});

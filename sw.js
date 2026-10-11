/*
 * 오프라인용 서비스 워커 (홈 화면에 추가했을 때 인터넷 없이도 열리게)
 *  - 같은 사이트의 파일만 다룸 (광고 등 외부 요청은 건드리지 않음)
 *  - 항상 인터넷에서 먼저 받아 최신 내용을 보여 주고, 실패하면 저장해 둔 것을 씀
 *  - 파일 목록이 바뀌면 VERSION을 올리면 됨
 */
const VERSION = "v1";
const CACHE = `bible-timeline-${VERSION}`;
const CORE = [
  "/",
  "/css/style.css",
  "/css/apple.css",
  "/js/theme-init.js",
  "/js/data.js",
  "/js/evidence.js",
  "/js/research.js",
  "/js/history.js",
  "/js/ads.js",
  "/js/bible-ref.js",
  "/js/app.js",
  "/img/favicon.svg",
  "/img/icon-192.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith("bible-timeline-") && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req)
      .then((res) => {
        if (res.ok) {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy));
        }
        return res;
      })
      .catch(() => caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match("/")))
  );
});

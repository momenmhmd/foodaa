/* Increment this version when the app shell changes. Old caches are removed on activation. */
const CACHE_NAME = "food-chain-quest-v2";
const APP_SHELL = [
  "./food_chain_quest_final.html",
  "./manifest.json",
  "./food_chain_background.jpg",
  "./food_chain_final_assets/wheat.jpg",
  "./food_chain_final_assets/grasshopper.jpg",
  "./food_chain_final_assets/frog.jpg",
  "./food_chain_final_assets/snake.jpg",
  "./food_chain_final_assets/hawk.jpg",
  "./%D9%8A.png",
  "./%D8%B3.png",
  "./%D8%B4.png",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-maskable-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    // A partial app shell cannot support reliable offline use. Keep the previous worker
    // active if any required file is missing or fails to download.
    await cache.addAll(APP_SHELL);
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith("food-chain-quest-") && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET" || new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cached = await caches.match(event.request);
    // Refresh navigations whenever online so users don't remain on a cached HTML version.
    if (event.request.mode !== "navigate" && cached) return cached;
    try {
      const response = await fetch(event.request);
      if (response.ok) {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(event.request, response.clone());
      }
      return response;
    } catch (error) {
      if (cached) return cached;
      if (event.request.mode === "navigate") {
        const appPage = await caches.match("./food_chain_quest_final.html");
        if (appPage) return appPage;
      }
      throw error;
    }
  })());
});

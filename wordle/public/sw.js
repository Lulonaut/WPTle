//! IF ANYTHING IN THIS FILE IS CHANGED MAKE SURE setVersion.js HAS ALSO BEEN UPDATED
// Increase the v number when the app is updated
const version = "1.0.4";
const cacheName = `wptle-v${version}`;

const assetsToCache = [
	"./",
	"./index.html",
	`./index-v${version}.css`,
	`./index-v${version}.js`,
	"./global.css",
];

/**
 * Special log function to clearly distinguish logs from the service worker.
 * @param {string} text - The text to log
 */
function log(text) {
	console.log("%cService Worker", "color: purple; font-weight: 600; background: white; padding: 0 5px; border-radius: 2px", text);
}

self.addEventListener("install", e => {
	log("Installing");
	// Activate this worker as soon as it finished installing instead of waiting
	// for every tab of the app to be closed. Without this a new deploy can sit
	// in the "waiting" state forever while an old tab keeps controlling the page.
	self.skipWaiting();
	e.waitUntil((async () => {
		const cache = await caches.open(cacheName);
		await cache.addAll(assetsToCache);
	})());
});

self.addEventListener("fetch", e => {
	e.respondWith((async () => {
		// Page navigations are fetched from the network first, so a new deploy
		// is picked up on the next visit. Fall back to the cached shell offline.
		if (e.request.mode === "navigate") {
			try {
				const response = await fetch(e.request);
				const cache = await caches.open(cacheName);
				cache.put(e.request, response.clone());
				return response;
			} catch {
				return (await caches.match(e.request)) || (await caches.match("./index.html"));
			}
		}

		log("Fetching definition");
		const r = await caches.match(e.request);
		if (r) {
			log("Definition found in cache");
			return r;
		};
		const response = await fetch(e.request);
		const cache = await caches.open("defs");
		log("Caching definition");
		cache.put(e.request, response.clone());
		return response;
	})());
});

// When the name of the cache changes (because the app has been updated) delete the old cache
self.addEventListener("activate", e => {
	e.waitUntil((async () => {
		const keys = await caches.keys();
		await Promise.all(keys.map((key) => {
			if (key === cacheName || key === "defs") return;
			log(`Cache updated to ${version}, old cache deleted`);
			return caches.delete(key);
		}));
		// Take control of already open pages so the fresh assets are used
		// immediately instead of only after the next reload.
		await self.clients.claim();
	})());
});

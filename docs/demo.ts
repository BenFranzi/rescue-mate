/// <reference lib="webworker" />
declare const self: ServiceWorkerGlobalScope;

const noopPromise = (...params) => new Promise(r => r(true));
const noop = (...params) => true;
const syncMessages = noopPromise;
const updateLocalNotifications = noopPromise;
const canBeCached = noop;


self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then(async (cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        const fetchResponse = await fetch(event.request);
        if (canBeCached(fetchResponse)) {
          const cache = await caches.open('my-cache');
          cache.put(event.request, fetchResponse.clone());
        }
        return fetchResponse;
      })
  );
});

self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-messages') {
    event.waitUntil(syncMessages());
  }
});

self.addEventListener('push', (event) => {
  const notification = event.data.json();
  event.waitUntil(
    Promise.all([
      updateLocalNotifications(notification),
      self.registration.showNotification(notification.title),
    ])
  );
});

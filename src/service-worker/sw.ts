/// <reference lib="webworker" />
import { addNotificationMessages, fetchAndCacheMessages, syncPendingMessages } from '@/shared/operations.ts';
import { Alert } from '@/shared/types.ts';
import { CRISIS_IMAGE_MAP } from '@/shared/config.ts';

declare const self: ServiceWorkerGlobalScope;

const CACHE_NAME = 'rescue-mate-v1';

const STATIC_ASSETS = [
  '',
  '/',
  '/index.html',
  '/manifest.json',
  './icons/icon.png',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png',
  ...Object.values(CRISIS_IMAGE_MAP),
];


self.addEventListener('install', (event: ExtendableEvent) => {
  console.log('SW: Install event received.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => Promise.all(
        STATIC_ASSETS.map(asset =>
          cache.add(asset).catch(error => console.warn(`SW: Failed to cache ${asset}:`, error))
        )
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event: ExtendableEvent) => {
  console.log('SW: Activate event received.');
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

async function cacheFirst(request: Request): Promise<Response> {
  const cache = await caches.open(CACHE_NAME);
  return (await cache.match(request)) ?? fetch(request).then(response => {
    if (response.ok) cache.put(request, response.clone());
    return response;
  });
}

self.addEventListener('fetch', (event: FetchEvent) => {
  const url = new URL(event.request.url);
  const isAsset = url.pathname.startsWith('/assets/')
    || STATIC_ASSETS.includes(url.pathname)
    || /\.(js|css)$/.test(url.pathname);

  if (event.request.method === 'GET' && isAsset) {
    console.log(`SW: Fetch event received, serving static content for "${url}"`);
    return event.respondWith(cacheFirst(event.request));
  }

  return event.respondWith(fetch(event.request));
});

const emitSyncEvent = () => self.clients.matchAll().then(clients =>
  clients.forEach(client => client.postMessage({ type: 'sync-complete' })));

self.addEventListener('sync', (event: ExtendableEvent & { tag?: string }) => {
  console.log(`SW: syncing in background, "${event.tag}"`);
  if (event.tag === 'sync-messages') {
    event.waitUntil(
      syncPendingMessages().then(() => emitSyncEvent())
    );
  }
});

self.addEventListener('push', (event: PushEvent) => {
  console.log('SW: Push event received.');
  if (!event.data) return;

  const alert = event.data.json() as Alert;
  const icon = CRISIS_IMAGE_MAP[alert.title as keyof typeof CRISIS_IMAGE_MAP] ?? '/icons/icon.png';
  const timestamp = new Date(alert.timestamp).toLocaleString();


  event.waitUntil(
    Promise.all([
      addNotificationMessages(alert),
      fetchAndCacheMessages(),
      self.registration.showNotification(alert.title, {
        body: timestamp,
        icon,
        badge: icon,
        tag: alert.id,
        data: alert,
        requireInteraction: true
      })
    ]).then(() => emitSyncEvent()),
  );
});
import serviceWorkerEntryUrl from '../../service-worker-entry.ts?worker&url';

let instance: ServiceWorkerRegistration | null = null;

const registerServiceWorker = async () => {
  return new Promise((resolve, reject) => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register(serviceWorkerEntryUrl,  { type: 'module', scope: '/' })
          .then(registration => {
            instance = registration;
            resolve(registration);
          })
          .catch(error => {
            console.error('ServiceWorker registration failed: ', error);
            reject(error);
          });
      });
    }
  });
};

export default registerServiceWorker;

export const getRegistration = (): ServiceWorkerRegistration => {
  if (!instance) {
    throw new Error('service worker not intialized, must call `registerServiceWorker`.');
  }
  return instance;
};
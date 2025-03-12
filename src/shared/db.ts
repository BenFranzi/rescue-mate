import { deleteDB, IDBPDatabase, openDB } from 'idb';
import { Alert, QueueItem } from '@/shared/types.ts';

export async function initDb(): Promise<IDBPDatabase> {

  return openDB('alert-store', 6, {
    async upgrade(db, oldVersion) {
      if (oldVersion) {
        await deleteDB('alert-store');
      }
      db.createObjectStore('alerts', { keyPath: 'id' });
      db.createObjectStore('syncQueue', { keyPath: 'id' });
      db.createObjectStore('configuration', { keyPath: 'id' });
    },
  });
}

export default {
  // Alert
  async addAlert(alert: Alert) {
    const db = await initDb();
    const tx = db.transaction('alerts', 'readwrite');
    const store = tx.objectStore('alerts');
    await store.put(alert);
    await tx.done;
  },
  async addAlerts(alerts: Alert[]) {
    const db = await initDb();
    const tx = db.transaction('alerts', 'readwrite');
    const store = tx.objectStore('alerts');
    for (const alert of alerts) await store.put(alert);
    await tx.done;
  },
  async getAllAlerts() {
    const db = await initDb();
    const tx = db.transaction('alerts', 'readonly');
    const store = tx.objectStore('alerts');
    return store.getAll();
  },
  async clearAllAlerts() {
    const db = await initDb();
    const tx = db.transaction('alerts', 'readwrite');
    const store = tx.objectStore('alerts');
    await store.clear();
    await tx.done;
  },

  // Sync Queue
  async addToSyncQueue(item: QueueItem) {
    const db = await initDb();
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    await store.add(item);
    await tx.done;
  },
  async removeFromSyncQueue(id: string) {
    const db = await initDb();
    const tx = db.transaction('syncQueue', 'readwrite');
    const store = tx.objectStore('syncQueue');
    await store.delete(id);
    await tx.done;
  },
  async getSyncQueue() {
    const db = await initDb();
    const tx = db.transaction('syncQueue', 'readonly');
    const store = tx.objectStore('syncQueue');
    return store.getAll();
  },

  // Configuration
  async setConfigItem(key: string, value: any) {
    const db = await initDb();
    const tx = db.transaction('configuration', 'readwrite');
    const store = tx.objectStore('configuration');
    await store.put(value, key);
    await tx.done;
  },
  async getConfigItem(key: string) {
    const db = await initDb();
    const tx = db.transaction('configuration', 'readonly');
    const store = tx.objectStore('configuration');
    return store.get(key);
  },
  async removeConfigItem(key: string) {
    const db = await initDb();
    const tx = db.transaction('configuration', 'readwrite'); 
    const store = tx.objectStore('configuration');
    await store.delete(key);
    await tx.done;
  }
};

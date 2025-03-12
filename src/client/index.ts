import { useSyncExternalStore } from 'react';
import { Alert, AlertPayload, QueueItem } from '@/shared/types.ts';
import { fetchAndCacheMessages, syncPendingMessages } from '@/shared/operations.ts';
import db from '@/shared/db.ts';
import { getRegistration } from '@/client/registerServiceWorker.ts';
import getIsOnline from '@/client/getIsOnline.ts';

interface StoreState {
  alerts: Alert[];
  queue: QueueItem[];
  error: undefined;
  isAddingAlert: boolean;
  isFetchingAlerts: boolean;
  isSyncingQueue: boolean;
}

class Store {
  private subscribers: Set<() => void>;
  private state: StoreState;

  constructor() {
    this.subscribers = new Set();
    const state = {
      alerts: [],
      queue: [],
      error: undefined,
      isAddingAlert: false,
      isFetchingAlerts: true,
      isSyncingQueue: false,
    };
    this.state = new Proxy(state, {
      set: (target, property: string, value: any) => {
        if (property in target) {
          (target[property as keyof StoreState] as any) = value;
          this.notify();
        }
        return true;
      }
    });

    // Setup message event listener
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('hit', event.data?.type);
      if (event.data?.type === 'sync-complete') {
        this.reloadFromMemory();
      }
    });
  }

  getState() {
    return this.state;
  }

  notify() {
    this.state = { ...this.state };
    this.subscribers.forEach(callback => callback());
  }

  subscribe(callback: () => void) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  async addAlert(alert: AlertPayload) {
    this.state.isAddingAlert = true;
    this.notify();
    await db.addToSyncQueue({ id: crypto.randomUUID(), data: alert });
    await this.syncAlerts();
    this.state.isAddingAlert = false;
    this.notify();
  }

  async fetchAlerts() {
    try {
      this.state.isFetchingAlerts = true;
      await this.reloadFromMemory();
      this.state.alerts = await fetchAndCacheMessages();
    } catch (error) {
      console.error('APP:', error);
    } finally {
      this.state.isFetchingAlerts = false;
      this.notify();
    }
  }

  async forceRefresh() {
    await db.clearAllAlerts();
    await this.fetchAlerts();
  }

  async reloadFromMemory() {
    this.state.alerts = await db.getAllAlerts();
    this.notify();
  }

  private async syncAlerts() {
    await this.requestBackgroundSync();
    if (getIsOnline()) {
      await this.fetchAlerts();
    } else {
      console.log('APP: skipping fetch, offline.');
    }
  }

  async requestBackgroundSync() {
    const registration = getRegistration();

    if (registration?.sync) {
      await registration.sync.register('sync-messages');
      console.log('APP: Background sync requested.');
    } else {
      console.warn('Browser does not support background sync, falling back to main.');
      await syncPendingMessages();
    }
  }
}

const store = new Store();
store.fetchAlerts();


export const useStore = () => {
  const state = useSyncExternalStore(
    store.subscribe.bind(store),
    () => store.getState(),
  );
  return {
    state,
    addAlert: store.addAlert.bind(store),
    forceRefresh: store.forceRefresh.bind(store),
    requestBackgroundSync: store.requestBackgroundSync.bind(store),
  };
};
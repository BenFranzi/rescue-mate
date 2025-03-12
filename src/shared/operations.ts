import db from '@/shared/db.ts';
import { Alert } from '@/shared/types.ts';
import config from '@/shared/config.ts';
import { getHeaders } from '@/shared/token.ts';

export async function fetchAndCacheMessages(force?: boolean) {
  const cached = await db.getAllAlerts();
  const lastAlertId = (cached.findLast(({ status }) => status === 'synced') as Alert)?.id;

  const response = await fetch(
    lastAlertId && !force ? `${config.apiUrl}/api/alerts?afterId=${lastAlertId}` : `${config.apiUrl}/api/alerts`,
    { headers: await getHeaders() },
  );
  const alerts = await response.json();
  await db.addAlerts(alerts);
  return await db.getAllAlerts();
}

export async function syncPendingMessages() {
  const queue = await db.getSyncQueue();

  for (const queueItem of queue) {
    const response = await fetch(`${config.apiUrl}/api/alerts`, {
      method: 'POST',
      headers: await getHeaders(),
      body: JSON.stringify(queueItem.data),
    });
    if (!response.ok) throw new Error('Failed to add alert');
    await response.json();
    await db.removeFromSyncQueue(queueItem.id);
  }
}

export async function addNotificationMessages(alert: Alert) {
  console.log('APP: adding alert from notification to local storage.');
  await db.addAlert(alert);
}
import { getRegistration } from '@/client/registerServiceWorker.ts';
import config from '@/shared/config.ts';
import { getHeaders } from '@/shared/token.ts';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const checkNotificationStatus = async () => {
  try {
    if (Notification.permission === 'granted') {
      const registration = await getRegistration();
      const subscription = await registration?.pushManager?.getSubscription();

      return Boolean(subscription);
    }
  } catch (error) {
    console.error('APP: Error checking notification status:', error);
    return false;
  }
};

const setupNotification = async () => {
  if (!('Notification' in window)) {
    throw new Error('This browser does not support notifications.'); // if this is Safari, the site needs to be installed to home screen
  }
  const permissionResult = await Notification.requestPermission();
  if (permissionResult !== 'granted') {
    throw new Error('We weren\'t granted permission.');
  }

  if (!getRegistration()?.pushManager) {
    throw new Error('Push notifications are not supported in this browser, no pushManager found on sw registration');
  }

  const { publicKey } = await fetch('/vapid.json').then((response) => response.json());

  const subscribeOptions = {
    // Notifications have to be shown for Chrome - https://web.dev/articles/push-notifications-subscribing-a-user#uservisibleonly_options
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  };


  const pushSubscription = await getRegistration().pushManager.subscribe(subscribeOptions);
  await fetch(`${config.apiUrl}/api/register`, {
    method: 'POST',
    body: JSON.stringify(pushSubscription),
    headers: await getHeaders(),
  });
};

export default setupNotification;
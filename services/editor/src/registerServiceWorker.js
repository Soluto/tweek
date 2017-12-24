import fetch from './utils/fetch';
import delay from './utils/delay';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

async function getSubscription(pushManager) {
  const subscription = await pushManager.getSubscription();
  if (subscription) return subscription;

  const response = await fetch('/api/push-service/public-key');
  const publicKey = await response.text();
  const applicationServerKey = urlBase64ToUint8Array(publicKey);
  return pushManager.subscribe({ userVisibleOnly: true, applicationServerKey });
}

const maxRetryCount = 3;

async function persistRegistration(subscription) {
  let retryCount = 0;

  while (true) {
    try {
      await fetch('/api/push-service/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });
    } catch (error) {
      console.error('Error during service worker registration', error);
      if (retryCount === maxRetryCount) throw error;
      retryCount++;

      await delay(60 * 1000);
      continue;
    }

    retryCount = 0;
    await delay(5 * 60 * 1000);
  }
}

export default async function register() {
  if ('serviceWorker' in navigator) {
    const response = await fetch('/api/editor-configuration/service_worker/is_enabled');
    const enabled = await response.json();

    if (!enabled) {
      console.log('service worker is disabled');
      unregister();
      return;
    }

    console.log('enabling service worker');
    const swUrl = `${process.env.PUBLIC_URL}/service-worker.bundle.js`;
    try {
      await navigator.serviceWorker.register(swUrl);

      Notification.requestPermission();

      const registration = await navigator.serviceWorker.ready;

      const subscription = await getSubscription(registration.pushManager);
      persistRegistration(subscription).catch(
        error => (console.error('unregistering service worker', error), registration.unregister()),
      );
    } catch (error) {
      console.error('Error during service worker registration:', error);
    }
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}

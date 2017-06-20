import fetch from './utils/fetch';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');

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

export default function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.bundle.js`;
      try {
        const registration = await navigator.serviceWorker.register(swUrl);

        Notification.requestPermission();

        const subscription = await getSubscription(registration.pushManager);
        await fetch('/api/push-service/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subscription),
        });
      } catch (error) {
        console.error('Error during service worker registration:', error);
      }
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.unregister();
    });
  }
}

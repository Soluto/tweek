import webPush from 'web-push';
import getVapidKeys from '../getVapidKeys';

const clients = {};

function log(...args) {
  console.log('[PUSH]', ...args);
}

export async function getPublicKey(req, res) {
  const vapidKeys = await getVapidKeys();
  res.send(vapidKeys.publicKey);
}

export async function register(req, res) {
  const subscription = req.body;
  if (subscription.endpoint in clients) {
    log('updating existing client');
  } else {
    log('registering new client');
  }

  await webPush.sendNotification(subscription, 'refresh');

  clients[subscription.endpoint] = subscription;
  log('registered clients:', Object.keys(clients).length);

  res.sendStatus(201);
}

export function notifyClients(payload = 'refresh') {
  log(`notifying ${Object.keys(clients).length} clients`);
  Object.keys(clients).forEach(async (clientId) => {
    const subscription = clients[clientId];
    try {
      await webPush.sendNotification(subscription, payload);
    } catch (error) {
      console.warn('error notifying client', error);
      delete clients[clientId];
    }
  });
}

import webPush from 'web-push';
import R from 'ramda';
import vapidKeys from '../vapid.json';

const clients = {};

function log(...args) {
  console.log('[PUSH]', ...args);
}

export function getPublicKey(req, res) {
  res.send(vapidKeys.publicKey);
}

export function register(req, res) {
  const subscription = req.body;
  if (subscription.endpoint in clients) {
    log('updating existing client');
  } else {
    log('registering new client');
  }
  clients[subscription.endpoint] = subscription;
  log('registered clients:', Object.keys(clients).length);
  res.sendStatus(201);
}

export function notifyClients(payload = 'refresh') {
  log(`notifying ${Object.keys(clients).length} clients`);
  Object.keys(clients).forEach(async (clientId) => {
    const subscription = clients[clientId];
    try {
      webPush.sendNotification(subscription, payload);
    } catch (error) {
      console.warn('error notifying client', error);
      delete clients[clientId];
    }
  });
}

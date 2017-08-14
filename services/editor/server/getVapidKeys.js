import fs from 'fs';
import { promisify } from 'util';
import nconf from 'nconf';
import webPush from 'web-push';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

let vapidKeys;

export default async function getKeys() {
  if (vapidKeys) return vapidKeys;

  const VAPID_KEYS = nconf.get('VAPID_KEYS');

  if (!fs.existsSync(VAPID_KEYS)) {
    vapidKeys = webPush.generateVAPIDKeys();
    await writeFile(VAPID_KEYS, JSON.stringify(vapidKeys));
    return vapidKeys;
  }

  const keysStr = await readFile(VAPID_KEYS);
  vapidKeys = JSON.parse(keysStr);
  return vapidKeys;
}

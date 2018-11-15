const axios = require('axios');
const nconf = require('nconf');

const delay = timeout => new Promise(resolve => setTimeout(resolve, timeout));

async function waitUntil(action, timeout = 15000, delayDuration = 25) {
  let shouldStop = false;
  const timeoutRef = setTimeout(() => (shouldStop = true), timeout);
  let error;
  while (!shouldStop) {
    try {
      await action();
      clearTimeout(timeoutRef);
      return;
    } catch (ex) {
      error = ex;
    }
    delayDuration && (await delay(delayDuration));
  }
  throw error;
}

function waitForClient(baseURL, timeout = 60000, delayDuration = 1000) {
  const client = axios.create({ baseURL });
  return waitUntil(() => client.get('/health'), timeout, delayDuration);
}

module.exports.waitForAllClients = async function() {
  const services = [
    nconf.get('EDITOR_URL'),
    nconf.get('TWEEK_API_URL'),
    nconf.get('AUTHORING_URL'),
  ];

  await Promise.all(services.map(s => waitForClient(s)));
};

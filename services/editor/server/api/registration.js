import Chance from 'chance';
const chance = new Chance();

const clients = {};

function log(...args) {
  console.log('[SOCKET]', ...args);
}

export const register = (socket) => {
  log('registering new client');
  const clientId = chance.guid();
  clients[clientId] = socket;
  socket.on('disconnect', () => delete clients[clientId]);
};

export const notifyClients = (msg = 'refresh') => {
  try {
    log(`notifying ${Object.keys(clients).length} clients`);
    Object.keys(clients).forEach(clientId => clients[clientId].emit(msg));
  } catch (err) {
    console.warn('error notifying clients', err);
  }
};

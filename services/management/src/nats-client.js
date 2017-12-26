const NATS = require('nats');

module.exports = function (url) {
  let nats;

  function connect() {
    nats = null;
    let connection = NATS.connect(url);
    connection.on('connect', (nc) => {
      nats = nc;
      console.log('[NATS] connected');
    });
    connection.on('error', (e) => {
      console.error('[NATS] connection error:', e.message);
      setTimeout(connect, 2000);
    });
    connection.on('close', () => {
      console.warn('[NATS] connection closed');
      connect();
    });
  }

  return {
    connect,
    publish(...args) {
      if (!nats) throw new Error('Nats is not connected');
      return nats.publish(...args);
    },
  };
};

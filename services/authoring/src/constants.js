const nconf = require('nconf');

nconf.argv().env().defaults({
  PORT: 3000,
  GIT_CLONE_TIMEOUT_IN_MINUTES: 1,
  CONTINUOUS_UPDATER_INTERVAL: 5000,
});
nconf.required([ 'GIT_URL', 'GIT_USER', 'GIT_PUBLIC_KEY_PATH', 'GIT_PRIVATE_KEY_PATH' ]);

const configs = [
  'PORT',
  'GIT_CLONE_TIMEOUT_IN_MINUTES',
  'GIT_URL',
  'GIT_USER',
  'GIT_PASSWORD',
  'GIT_PUBLIC_KEY_PATH',
  'GIT_PRIVATE_KEY_PATH',
  'CONTINUOUS_UPDATER_INTERVAL',
];

module.exports = configs.reduce((constants, config) => Object.assign({}, constants, { [config]: nconf.get(config) }), {});

import nconf = require('nconf');
import fs = require('fs');
import os = require('os');

function useFileFromBase64EnvVariable(inlineKeyName, fileKeyName) {
  const tmpDir = os.tmpdir();
  if (nconf.get(inlineKeyName) && !nconf.get(fileKeyName)) {
    const keyData = new Buffer(nconf.get(inlineKeyName), "base64");
    const newKeyPath = `${tmpDir}/${fileKeyName}`;
    fs.writeFileSync(newKeyPath, keyData);
    nconf.set(fileKeyName, newKeyPath);
  }
}

nconf.use("memory").argv().env().defaults({
  PORT: 3000,
  GIT_CLONE_TIMEOUT_IN_MINUTES: 1,
  CONTINUOUS_UPDATER_INTERVAL: 5000,
});
useFileFromBase64EnvVariable("GIT_PUBLIC_KEY_INLINE", "GIT_PUBLIC_KEY_PATH");
useFileFromBase64EnvVariable("GIT_PRIVATE_KEY_INLINE", "GIT_PRIVATE_KEY_PATH");
nconf.required(['GIT_URL', 'GIT_USER', 'GIT_PUBLIC_KEY_PATH', 'GIT_PRIVATE_KEY_PATH']);

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

export = (configs.reduce((constants, config) => Object.assign({}, constants, { [config]: nconf.get(config) }), {}));

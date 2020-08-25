import nconf from 'nconf';
import fs from 'fs-extra';
import os from 'os';
import logger from './utils/logger';

function useFileFromBase64EnvVariable(inlineKeyName, fileKeyName) {
  const tmpDir = os.tmpdir();
  if (nconf.get(inlineKeyName) && !nconf.get(fileKeyName)) {
    const keyData = new Buffer(nconf.get(inlineKeyName), 'base64');
    const newKeyPath = `${tmpDir}/${fileKeyName}`;
    fs.writeFileSync(newKeyPath, keyData);
    nconf.set(fileKeyName, newKeyPath);
  }
}

nconf
  .use('memory')
  .argv()
  .env()
  .defaults({
    PORT: 3000,
    GIT_CLONE_TIMEOUT_IN_MINUTES: 1,
    CONTINUOUS_UPDATER_INTERVAL: 5000,
  });
useFileFromBase64EnvVariable('GIT_PUBLIC_KEY_INLINE', 'GIT_PUBLIC_KEY_PATH');
useFileFromBase64EnvVariable('GIT_PRIVATE_KEY_INLINE', 'GIT_PRIVATE_KEY_PATH');

const privateKeyPath = nconf.get('GIT_PRIVATE_KEY_PATH');
const privateKeyForCliPath = os.tmpdir() + '/tweek-authoring-ssh-key-for-cli';
fs.copyFileSync(privateKeyPath, privateKeyForCliPath);
fs.chmodSync(privateKeyForCliPath, 0o0600);
process.env['GIT_CLI_SSH_PRIVATE_KEY'] = privateKeyForCliPath;
process.on('beforeExit', () => {
  logger.trace('removing cli temp key...');
  fs.removeSync(privateKeyForCliPath);
  logger.trace('removing cli temp key - done');
});

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

export = configs.reduce(
  (constants, config) => Object.assign({}, constants, { [config]: nconf.get(config) }),
  {},
);

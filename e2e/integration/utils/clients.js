const nconf = require('nconf');
const supertest = require('supertest');
const fs = require('fs');
const getToken = require('./getToken');
const { promisify } = require('util');

const exists = promisify(fs.exists);
const readFile = promisify(fs.readFile);

const interceptAfter = (target, fn, methodNames) => {
  let proxy = methodNames.reduce(
    (acc, m) =>
      Object.assign(acc, {
        [m]: function(...args) {
          return fn(target[m].call(target, ...args));
        },
      }),
    {},
  );
  proxy.with = (newFn) => interceptAfter(target, newFn, methodNames);
  return proxy;
};

const restMethods = ['post', 'get', 'put', 'delete', 'patch', 'head'];

function createClient(targetUrl, intercept) {
  const client = supertest(targetUrl);
  return interceptAfter(client, intercept, ['request', ...restMethods]);
}

nconf
  .argv()
  .env()
  .defaults({
    GATEWAY_URL: 'http://localhost:8080',
    CLIENT_ID: 'admin-app',
    CLIENT_SECRET: '8v/iUG0vTH4BtVgkSn3Tng==',
    GIT_PRIVATE_KEY_PATH: '../../deployments/dev/ssh/tweekgit',

    MINIO_HOST: 'localhost',
    MINIO_PORT: '4007',
    MINIO_BUCKET: 'tweek',
    MINIO_ACCESS_KEY: 'AKIAIOSFODNN7EXAMPLE',
    MINIO_SECRET_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  });

const clientId = nconf.get('CLIENT_ID');
const clientSecret = nconf.get('CLIENT_SECRET');
const setCredentials = (t) => t.set('X-Client-Id', clientId).set('X-Client-Secret', clientSecret);

const getEnv = async (varName, base64) => {
  const inlineVar = nconf.get(`${varName}_INLINE`);
  const varFilePath = nconf.get(`${varName}_PATH`);
  const value =
    (!base64 && inlineVar) ||
    (base64 && inlineVar && new Buffer(inlineVar, 'base64')) ||
    (varFilePath && (await exists(varFilePath)) && (await readFile(varFilePath, 'utf8')));
  return value;
};

const init = async function() {
  const key = await getEnv('GIT_PRIVATE_KEY', true);
  const token = await getToken(key);
  const setBearerToken = (t) => t.set('Authorization', `Bearer ${token}`);
  return {
    gateway: createClient(nconf.get('GATEWAY_URL'), setBearerToken),
  };
};

module.exports = {
  init,
  gateway: createClient(nconf.get('GATEWAY_URL'), setCredentials),
};

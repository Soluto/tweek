const nconf = require('nconf');
const supertest = require('supertest');
const fs = require('fs');
const getToken = require('./getToken');

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
  proxy.with = newFn => interceptAfter(target, newFn, methodNames);
  return proxy;
};

const restMethods = ['post', 'get', 'put', 'delete', 'patch', 'head'];

function createClient(targetUrl, intercept) {
  return interceptAfter(supertest(targetUrl), intercept, ['request', ...restMethods]);
}

nconf
  .argv()
  .env()
  .defaults({
    AUTHORING_URL: 'http://authoring.localtest.me:4099',
    API_URL: 'http://api.localtest.me:4099',
    PUBLISHING_URL: 'http://localhost:4010',
    GATEWAY_URL: 'http://localhost:4099',
    GIT_PRIVATE_KEY_PATH: '../../deployments/dev/ssh/tweekgit',

    MINIO_HOST: 'localhost',
    MINIO_PORT: '4007',
    MINIO_BUCKET: 'tweek-bucket',
  });

const getEnv = (varName, base64) => {
  const inlineVar = nconf.get(`${varName}_INLINE`);
  const varFilePath = nconf.get(`${varName}_PATH`);
  const value =
    (!base64 && inlineVar) ||
    (base64 && inlineVar && new Buffer(inlineVar, 'base64')) ||
    (varFilePath && fs.existsSync(varFilePath) && fs.readFileSync(varFilePath, 'utf8'));
  return value;
};

const init = async function() {
  const key = getEnv('GIT_PRIVATE_KEY', true);
  const token = await getToken(key);
  const setBearerToken = t => t.set('Authorization', `Bearer ${token}`);
  return {
    api: createClient(nconf.get('API_URL'), setBearerToken),
    authoring: createClient(nconf.get('AUTHORING_URL'), setBearerToken),
    publishing: createClient(nconf.get('PUBLISHING_URL'), setBearerToken),
    gateway: createClient(nconf.get('GATEWAY_URL'), setBearerToken),
  };
};

module.exports = {
  init,
  getEnv,
};

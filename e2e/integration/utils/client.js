const nconf = require('nconf');
const supertest = require('supertest');

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

const restMethods = ['post', 'get', 'put', 'delete', 'patch', 'head', 'options'];

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

    MINIO_HOST: 'localhost',
    MINIO_PORT: '4007',
    MINIO_BUCKET: 'tweek',
    MINIO_ACCESS_KEY: 'AKIAIOSFODNN7EXAMPLE',
    MINIO_SECRET_KEY: 'wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY',
  });

const clientId = nconf.get('CLIENT_ID');
const clientSecret = nconf.get('CLIENT_SECRET');
const setCredentials = (t) => t.set('X-Client-Id', clientId).set('X-Client-Secret', clientSecret);

module.exports = createClient(nconf.get('GATEWAY_URL'), setCredentials);

const nconf = require('nconf');
const supertest = require('supertest');
const fs = require('fs');
const { promisify } = require('util');
const readFile = promisify(fs.readFile);
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
    AUTHORING_URL: 'http://authoring.localtest.me:4009',
    API_URL: 'http://api.localtest.me:4009',
    MANAGEMENT_URL: 'http://management.localtest.me:4009',
    GATEWAY_URL: 'http://localhost:4009',
    GIT_PRIVATE_KEY_PATH: '../../deployments/dev/ssh/tweekgit',
  });

module.exports.init = async function() {
  const inlineKey = nconf.get('GIT_PRIVATE_KEY_INLINE');
  const key =
    (inlineKey && new Buffer(inlineKey, 'base64')) ||
    (await readFile(nconf.get('GIT_PRIVATE_KEY_PATH')));

  const token = await getToken(key);
  const setBearerToken = t => t.set('Authorization', `Bearer ${token}`);
  return {
    api: createClient(nconf.get('API_URL'), setBearerToken),
    authoring: createClient(nconf.get('AUTHORING_URL'), setBearerToken),
    management: createClient(nconf.get('MANAGEMENT_URL'), setBearerToken),
    gateway: createClient(nconf.get('GATEWAY_URL'), setBearerToken),
  };
};

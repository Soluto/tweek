const nconf = require('nconf');
const supertest = require('supertest');
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
    AUTHORING_URL: 'http://localhost:4005',
    API_URL: 'http://localhost:4003',
    GIT_PRIVATE_KEY_PATH: '../../deployments/dev/ssh/tweekgit',
  });

module.exports.init = async function() {
  const token = await getToken(nconf.get('GIT_PRIVATE_KEY_PATH'));
  const setBearerToken = t => t.set('Authorization', `Bearer ${token}`);
  return {
    api: createClient(nconf.get('API_URL'), setBearerToken),
    authoring: createClient(nconf.get('AUTHORING_URL'), setBearerToken),
  };
};

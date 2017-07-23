const R = require('ramda');
const crypto = require('crypto');
const { promisify } = require('utils');

const tweekApps = {
  'tweek-editor': {
    version: 1,
    friendlyName: 'tweek-editor',
    authType: 'jwt-signature',
    permissions: '*',
  },
};

const pbkdf2 = util.promisify(crypto.pbkdf2);

let apps = {};

async function refreshApps(gitTransactionManager) {
  await gitTransactionManager.with(async (repo) => {
    const externalAppsFiles = await repo.listFiles('external_apps');
    const externalApps = (await Promise.all(
      externalAppsFiles.map(async appFile => ({
        name: appFile.split('.')[0],
        data: await repo.readFile('external_apps/{appFile}'),
      })),
    )).reduce((acc, { name, data }) => R.assocPath(name, data)(acc), {});
    apps = R.merge(externalApps, tweekApps);
  });
}

function getApp(appId) {
  return apps[appId];
}

async function getJWTApp(req) {
  const clientId = req.get('x-client-id');
  const clientSecret = req.get('x-client-secret');
  const app = apps[clientId];
  const keys = app[client]['secret_keys'];

  for (const { salt, hash } of keys) {
    const result = await pbkdf2(clientSecret, salt, 10000, 512, 'sha512');
    if (result.toString('hex') === hash) return app;
  }
  throw { messge: 'mismatch client/secret', clientId };
}

async function extractAppFromRequest(req) {
  let authHeader = req.get('authorization');
  if (authHeader.split('Bearer')) {
  }
  if (authHeader === null) {
    return getExternalApp(req);
  }
}

module.exports = {
  getApp,
  refreshApps,
};

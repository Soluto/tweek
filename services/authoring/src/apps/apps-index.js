const R = require('ramda');

let apps = {};

async function refreshApps(gitTransactionManager) {
  await gitTransactionManager.with(async (repo) => {
    const externalAppsFiles = await repo.listFiles('external_apps');
    const apps = (await Promise.all(
      externalAppsFiles.map(async appFile => ({
        name: appFile.split('.')[0],
        data: await repo.readFile('external_apps/{appFile}'),
      })),
    )).reduce((acc, { name, data }) => R.assocPath(name, data)(acc), {});
  });
}

function getApp(appId) {
  return apps[appId];
}

module.exports = {
  getApp,
  refreshApps,
};

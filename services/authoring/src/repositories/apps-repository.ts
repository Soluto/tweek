import R = require('ramda');
import Transactor from '../utils/transactor';
import GitRepository from './git-repository';

export type AppManifest = {
  version: string;
  name: string;
  secretKeys: { salt: string; hash: string; creationDate: string }[];
  permissions?: string[];
};

export default class AppsRepository {
  apps: { [id: string]: AppManifest };
  constructor(private _gitTransactionManager: Transactor<GitRepository>) {}

  getApp(appId) {
    return this.apps[appId];
  }

  async refresh() {
    await this._gitTransactionManager.with(async repo => {
      const externalAppsFiles = await repo.listFiles('external_apps');
      this.apps = <any>(await Promise.all(
        externalAppsFiles.map(async appFile => ({
          name: appFile.split('.')[0],
          data: JSON.parse(await repo.readFile(`external_apps/${appFile}`)),
        })),
      )).reduce((acc, { name, data }) => R.assoc(name, data)(acc), {});
    });
  }

  async getApps() {
    return this.apps;
  }

  async saveApp(appId, manifest, author) {
    return await this._gitTransactionManager.write(async repo => {
      await repo.updateFile(`external_apps/${appId}.json`, JSON.stringify(manifest, null, 4));
      const commitId = await repo.commitAndPush(`created app ${appId}`, author);
      await this.refresh();
      return commitId;
    });
  }
}

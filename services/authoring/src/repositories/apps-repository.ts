import R = require('ramda');
import Transactor from '../utils/transactor';
import GitRepository from './git-repository';

export type AppSecretKey = {
  id: string;
  creationDate: Date;
  salt: string;
  hash: string;
};

export type AppManifest = {
  version: string;
  name: string;
  secretKeys: AppSecretKey[];
  permissions?: string[];
};

export default class AppsRepository {
  apps: Record<string, AppManifest>;
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

  async createApp(appId: string, manifest: AppManifest, author) {
    return await this._gitTransactionManager.write(async (repo) => {
      await repo.updateFile(`external_apps/${appId}.json`, JSON.stringify(manifest, null, 4));
      const commitId = await repo.commitAndPush(`created app ${appId}`, author);
      await this.refresh();
      return commitId;
    });
  }

  async updateApp(appId: string, manifest: Partial<Pick<AppManifest, 'name' | 'permissions'>>, author) {
    const appFileName = `external_apps/${appId}.json`;
    return await this._gitTransactionManager.write(async (repo) => {
      const app = this.apps[appId];
      if (!app) {
        throw new Error(`The app with id ${appId} doesn't exist`);
      }
      const updatedApp = { ...app, ...manifest };
      await repo.updateFile(appFileName, JSON.stringify(updatedApp));
      const commitId = await repo.commitAndPush(`updated app ${appId}`, author);
      await this.refresh();
      return commitId;
    });
  }

  async deleteApp(appId: string, author) {
    return await this._gitTransactionManager.write(async (repo) => {
      await repo.deleteFile(`external_apps/${appId}.json`);
      const commitId = await repo.commitAndPush(`deleted app ${appId}`, author);
      await this.refresh();
      return commitId;
    });
  }

  async createSecretKey(appId: string, secretKey: AppSecretKey, author) {
    const appFileName = `external_apps/${appId}.json`;
    return await this._gitTransactionManager.write(async (repo) => {
      const app = this.apps[appId];
      if (!app) {
        throw new Error(`The app with id ${appId} doesn't exist`);
      }

      if (app.secretKeys.some(k => k.id === secretKey.id)) {
        throw new Error(`Key ${secretKey.id} already exists`);
      }
      app.secretKeys.push(secretKey);
      await repo.updateFile(appFileName, JSON.stringify(app));
      const commitId = await repo.commitAndPush(`created secret key ${secretKey.id} for app ${appId}`, author);
      await this.refresh();
      return commitId;
    });
  }

  getSecretKeys(appId: string) {
    return this.apps[appId].secretKeys.reduce((acc, cur, idx) => ({ ...acc, [`legacy-${idx}`]: cur }), {});
  }

  getSecretKey(appId: string, keyId: string) {
    return this.apps[appId].secretKeys.find(k => k.id === keyId);
  }

  async deleteSecretKey(appId: string, keyId: string, author) {
    const appFileName = `external_apps/${appId}.json`;
    return await this._gitTransactionManager.write(async (repo) => {
      const app = this.apps[appId];
      if (!app) {
        throw new Error(`The app with id ${appId} doesn't exist`);
      }
      if (!app.secretKeys.some(k => k.id === keyId)) {
        throw new Error(`Key ${keyId} doesn't exists`);
      }
      app.secretKeys = app.secretKeys.filter(k => k.id !== keyId);
      await repo.updateFile(appFileName, JSON.stringify(app));
      const commitId = await repo.commitAndPush(`deleted secret key ${keyId} from app ${appId} `, author);
      await this.refresh();
      return commitId;
    });
  }
}

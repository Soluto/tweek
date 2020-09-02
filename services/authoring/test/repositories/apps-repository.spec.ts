import AppsRepository, { AppManifest } from '../../src/repositories/apps-repository';
import { createSecretKey } from '../../src/utils/app-utils';
import sinon from 'sinon';
import { expect } from 'chai';
import { v4 as uuidV4 } from 'uuid';

describe('AppsRepository', () => {
  const repoFiles = {};
  const mockGitRepo = {
    listFiles: (prefix?: string) => Object.keys(repoFiles).map(file => (prefix ? file.slice(prefix.length + 1) : file)),
    readFile: key => repoFiles[key],
    updateFile: (key, value) => (repoFiles[key] = value),
    deleteFile: key => delete repoFiles[key],
    commitAndPush: sinon.spy(),
  };

  const runAction = action => action(mockGitRepo);
  const mockTransactionManager = {
    write: runAction,
    read: runAction,
    with: runAction,
  };
  const target = new AppsRepository(<any>mockTransactionManager);

  const author = { name: 'some name', email: 'some email' };

  let appId: string;
  let keyId: string;

  it('should create app', async () => {
    // Arrange
    appId = uuidV4();
    const manifest: AppManifest = {
      name: 'some-app',
      version: '1.0',
      secretKeys: [],
    };

    // Act
    await target.createApp(appId, manifest, author);
  });

  it('should return app by id', async () => {
    // Act
    const app = await target.getApp(appId);

    // Assert
    expect(app).exist;
    expect(app).haveOwnProperty('name', 'some-app');
  });

  it('should update app', async () => {
    // Act
    await target.updateApp(appId, { name: 'new-app-name' }, author);

    // Assert
    const app = await target.getApp(appId);
    expect(app).haveOwnProperty('name', 'new-app-name');
  });

  it('should return all apps', async () => {
    // Act
    const apps = await target.getApps();

    // Assert
    expect(Object.keys(apps)).to.deep.equal([appId]);
  });

  it('should create secret key', async () => {
    // Act
    const { key: appSecretKey } = await createSecretKey();
    keyId = appSecretKey.id;
    await target.createSecretKey(appId, appSecretKey, author);
  });

  it('should get all secret keys by appId', async () => {
    // Act
    const appKeys = await target.getSecretKeys(appId);

    // Assert
    expect(Object.keys(appKeys)).to.have.lengthOf(1);
  });

  it('should get secret key by id', async () => {
    // Act
    const appKey = await target.getSecretKey(appId, keyId);

    // Assert
    expect(appKey).exist;
  });

  it('should delete secret key by id', async () => {
    // Act
    await target.deleteSecretKey(appId, keyId, author);

    // Assert
    const appKeys = await target.getSecretKeys(appId);
    expect(appKeys).to.deep.equal({});
  });

  it('should delete app', async () => {
    // Act
    await target.deleteApp(appId, author);

    // Assert
    const apps = await target.getApps();
    expect(Object.keys(apps)).to.have.lengthOf(0);
  });
});

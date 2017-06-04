/* global jest, beforeEach, afterEach, describe, it, expect */

import GitRepository from '../../../server/repositories/git-repository';
import { expect } from 'chai';
import { Repository, Remote, Signature, Clone } from 'nodegit';
import os from 'os';
import Chance from 'chance';
import rimraf from 'rimraf';
const fs = require('fs');
const promisify = (fn, context) => (...args) =>
  new Promise((resolve, reject) =>
    fn.call(context, ...args.concat([(err, res) => (!!err ? reject(err) : resolve(res))])),
  );
const rimrafAsync = promisify(rimraf);

const createRandomDirectorySync = (prefix = '') => {
  const chance = new Chance();
  const path = `${os.tmpdir()}/p${prefix}-${chance.guid()}`;
  fs.mkdirSync(path);
  return path;
};

describe('GitRepository', () => {
  let remoteFolder;
  let testFolder;
  async function checkRemoteRepository(asyncFnTest) {
    const tempFolder = await createRandomDirectorySync('temp');
    await Clone(remoteFolder, tempFolder);
    await asyncFnTest(tempFolder);
    await rimrafAsync(tempFolder);
  }

  beforeEach(async () => {
    remoteFolder = createRandomDirectorySync('remote');
    testFolder = createRandomDirectorySync('test');
    const tempFolder = createRandomDirectorySync('local');
    await Repository.init(remoteFolder, 1);
    const localRepo = await Repository.init(tempFolder, 0);
    fs.mkdirSync(`${tempFolder}/rules`);
    fs.mkdirSync(`${tempFolder}/rules/path`);
    fs.mkdirSync(`${tempFolder}/rules/path/to`);
    fs.writeFileSync(`${tempFolder}/rules/path/to/someRule.jpad`, '[]');
    await localRepo.createCommitOnHead(
      ['rules/path/to/someRule.jpad'],
      Signature.now('myuser', 'myuser@soluto.com'),
      Signature.now('myuser', 'myuser@soluto.com'),
      'test',
    );

    const remote = Remote.create(localRepo, 'origin', remoteFolder);
    await remote.push(['refs/heads/master:refs/heads/master']);
    await rimrafAsync(tempFolder);
  });

  afterEach(async () => {
    // await rimrafAsync(remoteFolder);
    // await rimrafAsync(testFolder);
  });

  it('should be able to read rules list', async function () {
    this.timeout(15000);
    const repo = GitRepository.init({ url: remoteFolder, localPath: testFolder });
    const rules = await repo.getFileNames();
    expect(rules.length).to.equal(1);
  });

  it('should be able to read key data', async function () {
    this.timeout(15000);
    const repo = GitRepository.init({ url: remoteFolder, localPath: testFolder });
    const key = await repo.readFile('rules/path/to/someRule.jpad');

    const expectedRule = {
      fileContent: '[]',
      lastModifyDate: new Date(),
    };

    // TODO: chekck modify date
    expect(key.fileContent).to.equals(expectedRule.fileContent);
  });

  it('should be able to update key data', async function () {
    this.timeout(15000);
    const repo = GitRepository.init({ url: remoteFolder, localPath: testFolder });
    const key = await repo.readFile('rules/path/to/someRule.jpad');
    expect(key.fileContent).to.equals('[]');
    await repo.updateFile('rules/path/to/someRule.jpad', '[{}]', {
      name: 'test',
      email: 'test@soluto.com',
    });
    await checkRemoteRepository(async (path) => {
      expect(fs.readFileSync(`${path}/rules/path/to/someRule.jpad`, { encoding: 'utf-8' })).to.equal(
        '[{}]',
      );
    });
  });

  it('should be able to add file when path contains non-existing folder', async function () {
    this.timeout(15000);
    const repo = GitRepository.init({ url: remoteFolder, localPath: testFolder });
    await repo.updateFile('rules/path2/someRule.jpad', '[{}]', {
      name: 'test',
      email: 'test@soluto.com',
    });
    await checkRemoteRepository(async (path) => {
      expect(fs.readFileSync(`${path}/rules/path2/someRule.jpad`, { encoding: 'utf-8' })).to.equal(
        '[{}]',
      );
    });
  });
});

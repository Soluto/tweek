/* global jest, beforeEach, afterEach, describe, it, expect */

import { init } from '../../modules/server/repositories/GitRepository';
import { expect } from 'chai';
import { Repository, Remote, Signature, Clone } from 'nodegit';
import os from 'os';
import Chance from 'chance';
import rimraf from 'rimraf';
const fs = require('fs');
const promisify = (fn, context) => (...args) => new Promise((resolve, reject) =>
fn.call(context, ...args.concat([(err, res) => !!(err) ? reject(err) : resolve(res)])));
const rimrafAsync = promisify(rimraf);

const createRandomDirectorySync = (prefix = '') => {
  const chance = new Chance();
  const path = `${os.tmpdir()}/p${prefix}-${chance.guid()}`;
  fs.mkdirSync(path);
  return path;
};

describe('clone test', () => {
  let remoteFolder;
  let testFolder;
  async function checkRemoteRepository(asyncFnTest) {
    const tempFolder = await createRandomDirectorySync('temp');
    await Clone(remoteFolder, tempFolder);
    await asyncFnTest(tempFolder);
    await rimrafAsync(tempFolder);
  }

  beforeEach(async function() {
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
              'test'
            );

    const remote = Remote.create(localRepo, 'origin', remoteFolder);
    await remote.push(['refs/heads/master:refs/heads/master']);
    await rimrafAsync(tempFolder);
  });

  afterEach(async function() {
    // await rimrafAsync(remoteFolder);
    // await rimrafAsync(testFolder);
  });

  it('should be able to read rules list', async function() {
    this.timeout(15000);
    const repo = init({ url: remoteFolder, localPath: testFolder });
    const rules = await repo.getAllRules();
    expect(rules.length).to.equal(1);
  });

  it('should be able to read rule data', async function() {
    this.timeout(15000);
    const repo = init({ url: remoteFolder, localPath: testFolder });
    const rule = await repo.getRule('path/to/someRule.jpad');
    expect(rule).to.equals('[]');
  });

  it('should be able to update rule data', async function() {
    this.timeout(15000);
    const repo = init({ url: remoteFolder, localPath: testFolder });
    const rule = await repo.getRule('path/to/someRule.jpad');
    expect(rule).to.equals('[]');
    await repo.updateRule('path/to/someRule.jpad', '[{}]');
    await checkRemoteRepository(async path => {
      expect(fs.readFileSync(`${path}/rules/path/to/someRule.jpad`, { encoding: 'utf-8' })).to.equal('[{}]');
    });
  });
});


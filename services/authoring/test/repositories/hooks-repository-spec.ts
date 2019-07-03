import HooksRepository from '../../src/repositories/hooks-repository';
import { Hook, KeyHooks } from '../../src/utils/hooks';
import Author from '../../src/utils/author';
import sinon from 'sinon';

const chai = require('chai');
chai.use(require('sinon-chai'));
const expect = chai.expect;

describe('HooksRepository', () => {
  let mockGitRepo = <any>{};
  const runAction = (action) => action(mockGitRepo);
  const mockTransactionManager = {
    write: runAction,
    read: runAction,
    with: runAction,
  };
  const hooksRepo = new HooksRepository(<any>mockTransactionManager);

  const hooksFilePath = 'hooks.json';
  let testHooks: KeyHooks[];
  let testHooksJson: string;
  let testAuthor: Author;

  beforeEach(() => {
    mockGitRepo = <any>{};
    testHooks = [
      {
        keyPath: 'path/to/key',
        hooks: [
          { type: 'notification_webhook', url: 'http://some-domain/awesome_hook' },
          { type: 'notification_webhook', url: 'http://some-domain/another_awesome_hook' },
        ],
      },
      {
        keyPath: 'wildcard/path/*',
        hooks: [{ type: 'notification_webhook', url: 'https://some-domain/awesome_hook' }],
      },
    ];
    testHooksJson = JSON.stringify(testHooks);
    testAuthor = { name: 'Joel', email: 'joel@lou.com' };
  });

  describe('getHooks', () => {
    beforeEach(() => {
      mockGitRepo.readFile = sinon.stub().returns(testHooksJson);
    });

    it('returns the hooks from the hooks file in the git repo', async () => {
      const hooks = await hooksRepo.getHooks();

      expect(hooks).to.eql(testHooks);
    });
  });

  describe('getHooksForKeyPath', () => {
    beforeEach(() => {
      mockGitRepo.readFile = sinon.stub().returns(testHooksJson);
    });

    it('returns the hooks for a specific keyPath', async () => {
      const keyHooks = await hooksRepo.getHooksForKeyPath(testHooks[0].keyPath);

      expect(keyHooks).to.eql(testHooks[0]);
    });
  });

  describe('_updateHooksFile', () => {
    const _updateHooksFile = hooksRepo['_updateHooksFile'].bind(hooksRepo);

    beforeEach(() => {
      mockGitRepo.updateFile = sinon.spy();
      mockGitRepo.commitAndPush = sinon.spy();
    });

    it('updates the hooks file with the new hooks', async () => {
      const newHooks = [testHooks[1]];
      await _updateHooksFile(newHooks, testAuthor);

      expect(mockGitRepo.updateFile).to.have.been.calledOnceWith(
        hooksFilePath,
        JSON.stringify(newHooks),
      );
      expect(mockGitRepo.commitAndPush).to.have.been.calledOnceWith('Updating hooks', testAuthor);
    });
  });

  describe('_getKeyHooks', () => {
    const _getKeyHooks = hooksRepo['_getKeyHooks'].bind(hooksRepo);

    it('returns the keyHooks entry for the given keyPath', () => {
      const keyHooks = _getKeyHooks(testHooks, testHooks[0].keyPath);

      expect(keyHooks).to.eql(testHooks[0]);
    });
  });

  describe('createHook', () => {
    let newHook: Hook;

    beforeEach(() => {
      mockGitRepo.readFile = sinon.stub().returns(testHooksJson);
      mockGitRepo.updateFile = sinon.spy();
      mockGitRepo.commitAndPush = sinon.spy();

      newHook = { type: 'notification_webhook', url: 'http://not-a-real/url' };
    });

    it('creates a hook on a keyPath that has existing hooks', async () => {
      const keyPath = testHooks[1].keyPath;

      await hooksRepo.createHook(keyPath, newHook, testAuthor);

      testHooks[1].hooks.push(newHook);
      expect(mockGitRepo.updateFile).to.have.been.calledOnceWith(
        hooksFilePath,
        JSON.stringify(testHooks),
      );
      expect(mockGitRepo.commitAndPush).to.have.been.calledOnceWith('Updating hooks', testAuthor);
    });

    it('creates a hook on a keyPath without existing hooks', async () => {
      const keyPath = 'non/existing/new/path';

      await hooksRepo.createHook(keyPath, newHook, testAuthor);

      testHooks.push({ keyPath, hooks: [newHook] });
      expect(mockGitRepo.updateFile).to.have.been.calledOnceWith(
        hooksFilePath,
        JSON.stringify(testHooks),
      );
      expect(mockGitRepo.commitAndPush).to.have.been.calledOnceWith('Updating hooks', testAuthor);
    });
  });

  describe('updateHook', () => {
    beforeEach(() => {
      mockGitRepo.readFile = sinon.stub().returns(testHooksJson);
      mockGitRepo.updateFile = sinon.spy();
      mockGitRepo.commitAndPush = sinon.spy();
    });

    it('updates a hook', async () => {
      const keyPath = testHooks[0].keyPath;
      const index = 1;
      const updatedHook = { type: 'notification_webhook', url: 'http://not-a-real/url' };

      await hooksRepo.updateHook(keyPath, index, updatedHook, testAuthor);

      testHooks[0].hooks[index] = updatedHook;
      expect(mockGitRepo.updateFile).to.have.been.calledOnceWith(
        hooksFilePath,
        JSON.stringify(testHooks),
      );
      expect(mockGitRepo.commitAndPush).to.have.been.calledOnceWith('Updating hooks', testAuthor);
    });
  });

  describe('deleteHook', () => {
    beforeEach(() => {
      mockGitRepo.readFile = sinon.stub().returns(testHooksJson);
      mockGitRepo.updateFile = sinon.spy();
      mockGitRepo.commitAndPush = sinon.spy();
    });

    it('deletes a hook from a keyPath with multiple hooks', async () => {
      const keyPath = testHooks[0].keyPath;
      const index = 0;

      await hooksRepo.deleteHook(keyPath, index, testAuthor);

      testHooks[0].hooks.splice(index, 1);
      expect(mockGitRepo.updateFile).to.have.been.calledOnceWith(
        hooksFilePath,
        JSON.stringify(testHooks),
      );
      expect(mockGitRepo.commitAndPush).to.have.been.calledOnceWith('Updating hooks', testAuthor);
    });

    it('deletes the entire entry for the keyPath if the deleted hook was the only hook on this keyPath', async () => {
      const keyPath = testHooks[1].keyPath;
      const index = 0;

      await hooksRepo.deleteHook(keyPath, index, testAuthor);

      testHooks.splice(1, 1);
      expect(mockGitRepo.updateFile).to.have.been.calledOnceWith(
        hooksFilePath,
        JSON.stringify(testHooks),
      );
      expect(mockGitRepo.commitAndPush).to.have.been.calledOnceWith('Updating hooks', testAuthor);
    });
  });
});

import { HooksRepository } from '../../src/repositories/hooks-repository';
import Hook from '../../src/utils/hook';
import Author from '../../src/utils/author';
import sinon from 'sinon';

const chai = require('chai');
chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
const expect = chai.expect;

describe('HooksRepository', () => {
  let mockGitRepo;
  let hooksRepo: HooksRepository;
  const runAction = (action) => action(mockGitRepo);
  const mockTransactionManager = {
    write: runAction,
    read: runAction,
    with: runAction,
  };

  const hooksFilePath = 'hooks.json';
  const missingHooksFileMessage = `the path '${hooksFilePath}' does not exist in the given tree`;
  let testHooks: Hook[];
  let testHooksJson: string;
  let testAuthor: Author;

  beforeEach(() => {
    mockGitRepo = <any>{};
    hooksRepo = new HooksRepository(<any>mockTransactionManager);

    testHooks = [
      {
        id: 'id1',
        keyPath: 'path/to/key',
        type: 'notification_webhook',
        url: 'http://some-domain/awesome_hook',
      },
      {
        id: 'id2',
        keyPath: 'path/to/key',
        type: 'notification_webhook',
        url: 'http://some-domain/another_awesome_hook',
      },
      {
        id: 'id3',
        keyPath: 'wildcard/path/*',
        type: 'notification_webhook',
        url: 'https://some-domain/awesome_hook',
      },
    ];
    testHooksJson = JSON.stringify(testHooks);
    testAuthor = { name: 'Joel', email: 'joel@lou.com' };
  });

  describe('getHooks', () => {
    it('returns the hooks from the hooks file in the git repo', async () => {
      mockGitRepo.readFile = sinon.stub().returns(testHooksJson);

      await expect(hooksRepo.getHooks()).to.become(testHooks);
    });

    it('returns an empty array if the hooks file does not exist', async () => {
      mockGitRepo.readFile = sinon.stub().rejects(new Error(missingHooksFileMessage));

      await expect(hooksRepo.getHooks()).to.become([]);
    });

    it('throws an error if it failed reading the hooks file', async () => {
      const err = new Error('some random error while reading the file');
      mockGitRepo.readFile = sinon.stub().rejects(err);

      await expect(hooksRepo.getHooks()).to.be.rejectedWith(err);
    });
  });

  describe('_updateHooksFile', () => {
    let _updateHooksFile;

    beforeEach(() => {
      _updateHooksFile = hooksRepo['_updateHooksFile'].bind(hooksRepo);
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

  describe('createHook', () => {
    beforeEach(() => {
      mockGitRepo.readFile = sinon.stub().returns(testHooksJson);
      mockGitRepo.updateFile = sinon.spy();
      mockGitRepo.commitAndPush = sinon.spy();
    });

    it('creates a hook', async () => {
      const newHook = {
        keyPath: 'some/path',
        type: 'notification_webhook',
        url: 'http://not-a-real/url',
      };
      await hooksRepo.createHook(newHook, testAuthor);

      testHooks.push(newHook);
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
      const id = testHooks[0].id;
      const updatedHook = {
        id,
        keyPath: 'updated/key/path',
        type: 'notification_webhook',
        url: 'http://not-a-real/url',
      };

      await hooksRepo.updateHook(updatedHook, testAuthor);

      testHooks[0] = updatedHook;
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
      const id = testHooks[1].id;

      await hooksRepo.deleteHook(id, testAuthor);

      testHooks.splice(1, 1);
      expect(mockGitRepo.updateFile).to.have.been.calledOnceWith(
        hooksFilePath,
        JSON.stringify(testHooks),
      );
      expect(mockGitRepo.commitAndPush).to.have.been.calledOnceWith('Updating hooks', testAuthor);
    });
  });
});

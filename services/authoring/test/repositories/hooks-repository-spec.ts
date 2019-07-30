import { HooksRepository } from '../../src/repositories/hooks-repository';
import Hook from '../../src/utils/hook';
import Author from '../../src/utils/author';
import sinon from 'sinon';

const chai = require('chai');
chai.use(require('sinon-chai'));
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
    beforeEach(() => {
      mockGitRepo.readFile = sinon.stub().returns(testHooksJson);
    });

    it('returns the hooks from the hooks file in the git repo', async () => {
      const hooks = await hooksRepo.getHooks();

      expect(hooks).to.eql(testHooks);
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

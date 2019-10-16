import * as chai from 'chai';
import 'mocha';
import sinon from 'sinon';
import 'sinon-chai';
import { PolicyRepository } from '../../src/repositories/policy-repository';
import { PolicyRule, Author } from '../../src/utils';

chai.use(require('sinon-chai'));
chai.use(require('chai-as-promised'));
const { expect } = chai;

const SecurityFilePath = 'security/policy.json';
const PolicyRules: PolicyRule[] = [
  {
    group: '*',
    user: '*',
    contexts: {},
    object: 'values/*',
    action: '*',
    effect: 'allow',
  },
  {
    group: 'some-group',
    user: '*',
    contexts: {},
    object: 'repo/keys/some/keys/*',
    action: 'write',
    effect: 'allow',
  },
];
const Author: Author = { name: 'test-user', email: 'some@email.com' };

describe('PolicyRepository', () => {
  let mockGitRepo;
  let policyRepo: PolicyRepository;
  const runAction = (action) => action(mockGitRepo);
  const mockTransactionManager = {
    write: runAction,
    read: runAction,
    with: runAction,
  };

  beforeEach(() => {
    mockGitRepo = <any>{};
    policyRepo = new PolicyRepository(<any>mockTransactionManager);
  });

  describe('getPolicy', () => {
    it('returns the global policy rules', async () => {
      mockGitRepo.readFile = sinon.stub().returns(JSON.stringify(PolicyRules));

      const rules = await policyRepo.getPolicy();
      expect(rules).to.deep.eq(PolicyRules);
    });

    it('returns the directory resource policy rules', async () => {
      mockGitRepo.readFile = sinon.stub().returns(JSON.stringify(PolicyRules));

      const rules = await policyRepo.getPolicy({ isKey: false, path: 'some/path/to/dir' });
      expect(rules).to.deep.eq(PolicyRules);
    });

    it('returns the key resource policy rules', async () => {
      mockGitRepo.readFile = sinon.stub().returns(JSON.stringify({ policy: PolicyRules }));

      const rules = await policyRepo.getPolicy({ isKey: true, path: 'some/path/to/key' });
      expect(rules).to.deep.eq(PolicyRules);
    });
  });

  describe('replacePolicy', () => {
    it('replace global policy rules', async () => {
      mockGitRepo.updateFile = sinon.spy();
      mockGitRepo.commitAndPush = sinon.spy();

      await policyRepo.replacePolicy(PolicyRules, Author);
      expect(mockGitRepo.updateFile).to.have.been.calledOnceWith(
        SecurityFilePath,
        JSON.stringify(PolicyRules, null, 4),
      );
      expect(mockGitRepo.commitAndPush).to.have.been.calledOnceWith(`Updating policy`, Author);
    });

    it('replace dir policy rules', async () => {
      mockGitRepo.updateFile = sinon.spy();
      mockGitRepo.commitAndPush = sinon.spy();

      await policyRepo.replacePolicy(PolicyRules, Author, {
        isKey: false,
        path: 'some/path/to/dir',
      });
      expect(mockGitRepo.updateFile).to.have.been.calledOnceWith(
        'manifests/some/path/to/dir/policy.json',
        JSON.stringify(PolicyRules, null, 4),
      );
      expect(mockGitRepo.commitAndPush).to.have.been.calledOnceWith(`Updating policy`, Author);
    });

    it('replace key policy rules', async () => {
      const keyMeta = { some: 'metadata', policy: [] };
      mockGitRepo.readFile = sinon.stub().returns(JSON.stringify(keyMeta));
      mockGitRepo.updateFile = sinon.spy();
      mockGitRepo.commitAndPush = sinon.spy();

      await policyRepo.replacePolicy(PolicyRules, Author, {
        isKey: true,
        path: 'some/path/to/key',
      });
      expect(mockGitRepo.updateFile).to.have.been.calledOnceWith(
        'manifests/some/path/to/key.json',
        JSON.stringify({ ...keyMeta, policy: PolicyRules }, null, 4),
      );
      expect(mockGitRepo.commitAndPush).to.have.been.calledOnceWith(`Updating policy`, Author);
    });
  });
});

/* global jest, beforeEach, describe, it */
jest.unmock('../../../modules/server/repositories/RulesRepository');
import RulesRepository from '../../../modules/server/repositories/RulesRepository';
const chai = require('chai');
chai.use(require('chai-as-promised'));
const { expect, assert } = chai;

describe('RulesRepository', () => {
  let gitMock = {};
  let rulesRepo = new RulesRepository(gitMock);

  describe('getAllRules', async () => {
    it('should be able to get all rules from git repo: call git repo with correct folder name, remove jpad suffix and return correct items', async () => {
      // Arrange
      gitMock.getFileNames = jest.fn(async () => ['rules/abc.jpad', 'rules/def.jpad', 'rules/nested/key.jpad', 'abcd/def.jpad']);

      const expectedRules = ['rules/abc', 'rules/def', 'rules/nested/key', 'abcd/def'];

      // Act
      let results = await rulesRepo.getAllRules();

      // Assert
      expect(results).to.eql(expectedRules);
      expect(gitMock.getFileNames.mock.calls.length).to.eql(1);
      expect(gitMock.getFileNames.mock.calls[0][0]).to.eql(RulesRepository.RULES_REPOSITORY_DIRECTORY_NAME);
    });

    it('should fail: git repo getFileNames rejected', async () => {
      // Arrange
      const expectedException = 'some exception';

      gitMock.getFileNames = () => Promise.reject(expectedException);

      // Act
      try {
        await rulesRepo.getAllRules();
      } catch (exception) {
        // Assert
        expect(exception).to.eql(expectedException);
      }
    });
  });

  describe('getRule', () => {
    it('should be able to get rule content: call git repo with correct rule name and return correct file content', async () => {
      // Arrange
      const jpadFileContentMock = 'some rule content';
      const requestedRuleName = 'some rule name';

      const expectedFileName =
        `${RulesRepository.RULES_REPOSITORY_DIRECTORY_NAME}/${requestedRuleName}${RulesRepository.RULES_REPOSITORY_FILE_EXTENSION_NAME}`;

      gitMock.readFile = jest.fn(async () => jpadFileContentMock);

      // Act
      let result = await rulesRepo.getRule(requestedRuleName);

      // Assert
      expect(result).to.eql(jpadFileContentMock);
      expect(gitMock.readFile.mock.calls.length).to.eql(1);
      expect(gitMock.readFile.mock.calls[0][0]).to.eql(expectedFileName);
    });

    it('should fail: git repo readFile rejected', async () => {
      // Arrange
      let expectedException = 'some exception';

      gitMock.readFile = () => Promise.reject(expectedException);

      // Act & Assert
      await expect(rulesRepo.getRule()).to.eventually.be.rejectedWith(expectedException);
    });
  });

  describe('updateRule', async () => {
    it('should be able to update rule content: call git repo with correct parameters', async () => {
      // Arrange
      const rulePayload = 'some rule content';
      const requestedRuleName = 'some rule name';

      const expectedFileName =
        `${RulesRepository.RULES_REPOSITORY_DIRECTORY_NAME}/${requestedRuleName}${RulesRepository.RULES_REPOSITORY_FILE_EXTENSION_NAME}`;

      const name = 'some user';
      const email = 'email';

      const expectedAuthor = {
        name,
        email,
      };

      gitMock.updateFile = jest.fn(() => Promise.resolve(''));

      // Act
      await rulesRepo.updateRule(requestedRuleName, rulePayload, expectedAuthor);

      // Assert
      expect(gitMock.updateFile.mock.calls.length).to.eql(1);
      expect(gitMock.updateFile.mock.calls[0][0]).to.eql(expectedFileName);
      expect(gitMock.updateFile.mock.calls[0][1]).to.eql(rulePayload);
      expect(gitMock.updateFile.mock.calls[0][2]).to.eql(expectedAuthor);
    });

    it('should fail: git repo updateFile rejected', async () => {
      // Arrange
      const expectedException = 'some exception';

      gitMock.updateFile = async () => Promise.reject(expectedException);

      // Act & Assert
      await expect(rulesRepo.updateRule()).to.eventually.be.rejectedWith(expectedException);
    });
  });
});

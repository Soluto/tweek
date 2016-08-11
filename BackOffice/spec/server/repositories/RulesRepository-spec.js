/* global jest, beforeEach, describe, it */
jest.unmock('../../../modules/server/repositories/RulesRepository');
jest.unmock('../../../spec-mocks/server/repositories/GitRepositoryMock');

import RulesRepository from '../../../modules/server/repositories/RulesRepository';
import GitRepositoryMock from '../../../spec-mocks/server/repositories/GitRepositoryMock';
const chai = require('chai');
chai.use(require('chai-as-promised'));
const { expect, assert } = chai;

describe('RulesRepository', () => {
  let gitMock = new GitRepositoryMock();
  let rulesRepo = new RulesRepository(gitMock);

  describe('getAllRules', async () => {
    it('should be able to get all rules from git repo: call git repo with correct folder name, remove jpad suffix and return correct items', async () => {
      // Arrange
      gitMock.setGetFileNames(true, ['rules/abc.jpad', 'rules/def.jpad', 'rules/nested/key.jpad', 'abcd/def.jpad']);

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

      gitMock.setGetFileNames(false, expectedException);

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

      const expectedLastModifyCompareUrl = 'some sha link';

      const expectedModifyDate = new Date();
      gitMock.setReadFileMock(jpadFileContentMock, expectedModifyDate, expectedLastModifyCompareUrl);

      // Act
      let result = await rulesRepo.getRule(requestedRuleName);

      // Assert
      expect(result.fileContent).to.eql(jpadFileContentMock);
      expect(result.lastModifyDate).to.eql(expectedModifyDate);
      expect(result.lastModifyCompareUrl).to.eql(expectedLastModifyCompareUrl);
      expect(gitMock.readFile.mock.calls.length).to.eql(1);
      expect(gitMock.readFile.mock.calls[0][0]).to.eql(expectedFileName);
    });

    it('should fail: git repo readFile rejected', async () => {
      // Arrange
      let expectedException = 'some exception';

      gitMock.setRejectedReadFileMock(expectedException);

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

      gitMock.setUpdateFile(true, '');

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

      gitMock.setUpdateFile(false, expectedException);

      // Act & Assert
      await expect(rulesRepo.updateRule()).to.eventually.be.rejectedWith(expectedException);
    });
  });
});

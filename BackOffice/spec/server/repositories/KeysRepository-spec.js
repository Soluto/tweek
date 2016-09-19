/* global jest, beforeEach, describe, it */
jest.unmock('../../../modules/server/repositories/KeysRepository');
jest.unmock('../../../spec-mocks/server/repositories/GitRepositoryMock');

import KeysRepository from '../../../modules/server/repositories/KeysRepository';
import GitRepositoryMock from '../../../spec-mocks/server/repositories/GitRepositoryMock';

const chai = require('chai');
chai.use(require('chai-as-promised'));
const { expect, assert } = chai;

describe('KeysRepository', () => {
  let gitMock = new GitRepositoryMock();
  let keysRepo = new KeysRepository(gitMock);

  describe('getAllKeys', async () => {
    it('should be able to get all keys from git repo: call git repo with correct folder name, remove jpad suffix and return correct items', async () => {
      // Arrange
      gitMock.setGetFileNames(true, ['rules/abc.jpad', 'rules/def.jpad', 'rules/nested/key.jpad', 'abcd/def.jpad']);

      const expectedKeys = ['rules/abc', 'rules/def', 'rules/nested/key', 'abcd/def'];

      // Act
      let results = await keysRepo.getAllKeys();

      // Assert
      expect(results).to.eql(expectedKeys);
      expect(gitMock.getFileNames.mock.calls.length).to.eql(1);
      expect(gitMock.getFileNames.mock.calls[0][0]).to.eql(KeysRepository.KEYS_REPOSITORY_DIRECTORY_NAME);
    });

    it('should fail: git repo getFileNames rejected', async () => {
      // Arrange
      const expectedException = 'some exception';

      gitMock.setGetFileNames(false, expectedException);

      // Act
      try {
        await keysRepo.getAllKeys();
      } catch (exception) {
        // Assert
        expect(exception).to.eql(expectedException);
      }
    });
  });

  describe('getKey', () => {
    it('should be able to get key content: call git repo with correct key name and return correct file content', async () => {
      // Arrange
      const jpadFileContentMock = 'some key content';
      const requestedKeyName = 'some key name';

      const expectedFileName =
        `${KeysRepository.KEYS_REPOSITORY_DIRECTORY_NAME}/${requestedKeyName}${KeysRepository.KEYS_REPOSITORY_FILE_EXTENSION_NAME}`;

      const expectedLastModifyCompareUrl = 'some sha link';

      const expectedModifyDate = new Date();
      gitMock.setReadFileMock(jpadFileContentMock, expectedModifyDate, expectedLastModifyCompareUrl);

      // Act
      let result = await keysRepo.getKey(requestedKeyName);

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
      await expect(keysRepo.getKey()).to.eventually.be.rejectedWith(expectedException);
    });
  });

  describe('updateKey', async () => {
    it('should be able to update key content: call git repo with correct parameters', async () => {
      // Arrange
      const rulePayload = 'some key content';
      const requestedKeyName = 'some key name';

      const expectedFileName =
        `${KeysRepository.KEYS_REPOSITORY_DIRECTORY_NAME}/${requestedKeyName}${KeysRepository.KEYS_REPOSITORY_FILE_EXTENSION_NAME}`;

      const name = 'some user';
      const email = 'email';

      const expectedAuthor = {
        name,
        email,
      };

      gitMock.setUpdateFile(true, '');

      // Act
      await keysRepo.updateKey(requestedKeyName, rulePayload, expectedAuthor);

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
      await expect(keysRepo.updateKey()).to.eventually.be.rejectedWith(expectedException);
    });
  });
});

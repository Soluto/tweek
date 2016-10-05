/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../modules/server/repositories/MetaRepository');
jest.unmock('../../../../spec-mocks/server/repositories/GitRepositoryMock');

import MetaRepository from '../../../../modules/server/repositories/MetaRepository';
import GitRepositoryMock from '../../../../spec-mocks/server/repositories/GitRepositoryMock';

const chai = require('chai');
chai.use(require('chai-as-promised'));
const { expect, assert } = chai;

describe('MetaRepository', () => {
  const gitMock = new GitRepositoryMock();
  const metaRepo = new MetaRepository(gitMock);

  describe('getKeyMeta', async () => {
    it('should be able to get key meta: call git repo with correct key name and return correct meta after parsing a json file', async () => {
      // Arrange
      const metaMock = {
        displayName: 'some displayName',
        description: 'some description',
        tags: ['tag1', 'tag2'],
      };

      const stringMetaMock = JSON.stringify(metaMock, null, 4);

      const requestedKeyName = 'some key name';

      const expectedFileName =
        `${MetaRepository.META_REPOSITORY_DIRECTORY_NAME}/${requestedKeyName}${MetaRepository.META_REPOSITORY_FILE_EXTENSION_NAME}`;

      gitMock.setReadFileMock(stringMetaMock, '');

      // Act
      let result = await metaRepo.getKeyMeta(requestedKeyName);

      // Assert
      expect(result).to.eql(metaMock);
      expect(gitMock.readFile.mock.calls.length).to.eql(1);
      expect(gitMock.readFile.mock.calls[0][0]).to.eql(expectedFileName);
    });

    it('should fail: git repo readFile rejected', async () => {
      // Arrange
      let expectedException = 'pita exception';

      gitMock.setRejectedReadFileMock(expectedException);

      // Act & Assert
      await expect(metaRepo.getKeyMeta()).to.eventually.be.rejectedWith(expectedException);
    });
  });

  describe('updateRuleMeta', async () => {
    it('should be able to update key meta: call git repo with correct parameters', async () => {
      // Arrange
      const metaMock = {
        displayName: 'some displayName',
        description: 'some description',
        tags: ['tag1', 'tag2'],
      };

      const metaPayload = JSON.stringify(metaMock, null, 4);
      const requestedKeyName = 'some key name';

      const expectedFileName =
        `${MetaRepository.META_REPOSITORY_DIRECTORY_NAME}/${requestedKeyName}${MetaRepository.META_REPOSITORY_FILE_EXTENSION_NAME}`;

      const name = 'some user';
      const email = 'email';

      const expectedAuthor = {
        name,
        email,
      };

      gitMock.setUpdateFile(true, '');

      // Act
      await metaRepo.updateRuleMeta(requestedKeyName, metaMock, expectedAuthor);

      // Assert
      expect(gitMock.updateFile.mock.calls.length).to.eql(1);
      expect(gitMock.updateFile.mock.calls[0][0]).to.eql(expectedFileName);
      expect(gitMock.updateFile.mock.calls[0][1]).to.eql(metaPayload);
      expect(gitMock.updateFile.mock.calls[0][2]).to.eql(expectedAuthor);
    });

    it('should fail: git repo updateFile rejected', async () => {
      // Arrange
      let expectedException = 'some exception';

      gitMock.setUpdateFile(false, expectedException);

      // Act & Assert
      await expect(metaRepo.updateRuleMeta()).to.eventually.be.rejectedWith(expectedException);
    });
  });
});

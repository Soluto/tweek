/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../modules/server/repositories/MetaRepository');

import MetaRepository from '../../../modules/server/repositories/MetaRepository';
const chai = require('chai');
chai.use(require('chai-as-promised'));
const { expect, assert } = chai;

describe('MetaRepository', () => {
  let gitMock = {};
  let metaRepo = new MetaRepository(gitMock);

  describe('getRuleMeta', async () => {
    it('should be able to get rule meta: call git repo with correct rule name and return correct meta after parsing a json file', async () => {
      // Arrange
      const metaMock = {
        displayName: 'some displayName',
        description: 'some description',
        tags: ['tag1', 'tag2'],
      };

      const stringMetaMock = JSON.stringify(metaMock);

      const requestedRuleName = 'some rule name';

      const expectedFileName =
        `${MetaRepository.META_REPOSITORY_DIRECTORY_NAME}/${requestedRuleName}${MetaRepository.META_REPOSITORY_FILE_EXTENSION_NAME}`;

      gitMock.readFile = jest.fn(async () => stringMetaMock);

      // Act
      let result = await metaRepo.getRuleMeta(requestedRuleName);

      // Assert
      expect(result).to.eql(metaMock);
      expect(gitMock.readFile.mock.calls.length).to.eql(1);
      expect(gitMock.readFile.mock.calls[0][0]).to.eql(expectedFileName);
    });

    it('should fail: git repo readFile rejected', async () => {
      // Arrange
      let expectedException = 'pita exception';

      gitMock.readFile = async () => Promise.reject(expectedException);

      // Act & Assert
      await expect(metaRepo.getRuleMeta()).to.eventually.be.rejectedWith(expectedException);
    });
  });

  describe('updateRuleMeta', async () => {
    it('should be able to update rule meta: call git repo with correct parameters', async () => {
      // Arrange
      const metaPayload = 'some meta';
      const requestedRuleName = 'some rule name';

      const expectedFileName =
        `${MetaRepository.META_REPOSITORY_DIRECTORY_NAME}/${requestedRuleName}${MetaRepository.META_REPOSITORY_FILE_EXTENSION_NAME}`;

      const name = 'some user';
      const email = 'email';

      const expectedAuthor = {
        name,
        email,
      };

      gitMock.updateFile = jest.fn(() => Promise.resolve(''));

      // Act
      await metaRepo.updateRuleMeta(requestedRuleName, metaPayload, expectedAuthor);

      // Assert
      expect(gitMock.updateFile.mock.calls.length).to.eql(1);
      expect(gitMock.updateFile.mock.calls[0][0]).to.eql(expectedFileName);
      expect(gitMock.updateFile.mock.calls[0][1]).to.eql(metaPayload);
      expect(gitMock.updateFile.mock.calls[0][2]).to.eql(expectedAuthor);
    });

    it('should fail: git repo updateFile rejected', async () => {
      // Arrange
      let expectedException = 'some exception';

      gitMock.updateFile = async () => {
        return Promise.reject(expectedException);
      };

      // Act & Assert
      await expect(metaRepo.updateRuleMeta()).to.eventually.be.rejectedWith(expectedException);
    });
  });
});

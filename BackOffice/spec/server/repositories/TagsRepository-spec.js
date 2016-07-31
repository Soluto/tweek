/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../modules/server/repositories/TagsRepository');

import TagsRepository from '../../../modules/server/repositories/TagsRepository';
const chai = require('chai');
chai.use(require('chai-as-promised'));
const { expect, assert } = chai;

describe('TagsRepository', () => {
  let gitMock = {};
  let tagsRepo = new TagsRepository(gitMock);

  describe('getTags', async () => {
    it('should be able to get all tags: call git repo with correct file name and return correct tags', async () => {
      // Arrange
      const tagsMock = [{
        name: 'tag1',
      }, {
        name: 'tag2',
      }];

      const stringTagsMock = JSON.stringify(tagsMock);

      gitMock.readFile = jest.fn(async () => stringTagsMock);

      // Act
      let result = await tagsRepo.getTags();

      // Assert
      expect(result).to.eql(tagsMock);
      expect(gitMock.readFile.mock.calls.length).to.eql(1);
      expect(gitMock.readFile.mock.calls[0][0]).to.eql(TagsRepository.TAGS_REPOSITORY_FILE_NAME);
    });

    it('should fail: git repo readFile rejected', async () => {
      // Arrange
      let expectedException = 'pita exception';

      gitMock.readFile = async () => Promise.reject(expectedException);

      // Act & Assert
      await expect(tagsRepo.getTags()).to.eventually.be.rejectedWith(expectedException);
    });
  });
});

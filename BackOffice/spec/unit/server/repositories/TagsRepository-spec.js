/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../modules/server/repositories/TagsRepository');
jest.unmock('../../../../spec-mocks/server/repositories/GitRepositoryMock');

import TagsRepository from '../../../../modules/server/repositories/TagsRepository';
import GitRepositoryMock from '../../../../spec-mocks/server/repositories/GitRepositoryMock';
import R from 'ramda';

const chai = require('chai');
chai.use(require('chai-as-promised'));
const { expect, assert } = chai;

describe('TagsRepository', () => {
  let gitMock = new GitRepositoryMock();
  let tagsRepo = new TagsRepository(gitMock);

  describe('getTags', async () => {
    const validAuthor = {
      name: 'some name',
      email: 'some email',
    };

    it('should be able to get all tags: call git repo with correct file name and return correct tags', async () => {
      // Arrange
      const tagsMock = [{ name: 'tag1' }, { name: 'tag2' }];

      const stringTagsMock = JSON.stringify(tagsMock, null, 4);

      gitMock.setReadFileMock(stringTagsMock, '');

      // Act
      let result = await tagsRepo.getTags();

      // Assert
      expect(result).to.eql(tagsMock);
      expect(gitMock.readFile.mock.calls.length).to.eql(1);
      expect(gitMock.readFile.mock.calls[0][0]).to.eql(TagsRepository.TAGS_REPOSITORY_FILE_NAME);
    });

    it('should be able to save new tags: call git repo with new tags file content', async () => {
      // Arrange
      const exsitingTagsMock = [{ name: 'tag1' }, { name: 'tag2' }];

      const newTagsMock = [{ name: 'tag3' }, { name: 'tag4' }, { name: 'tag1' }];

      gitMock.setReadFileMock(JSON.stringify(exsitingTagsMock, null, 4), '');
      gitMock.setUpdateFile(true, '');

      const expectedUpdateTagsFileContent = JSON.stringify(R.uniqBy(x => x.name, [...exsitingTagsMock, ...newTagsMock]), null, 4);

      // Act
      await tagsRepo.mergeNewTags(newTagsMock, validAuthor);

      // Assert
      expect(gitMock.updateFile.mock.calls.length).to.eql(1);
      expect(gitMock.updateFile.mock.calls[0][0]).to.eql(TagsRepository.TAGS_REPOSITORY_FILE_NAME, 'should call git repo update file with correct file name');
      expect(gitMock.updateFile.mock.calls[0][1]).to.eql(expectedUpdateTagsFileContent);
      expect(gitMock.updateFile.mock.calls[0][2]).to.eql(validAuthor, 'should call git repo with correct author');
    });

    it('should return empty array: git repo readFile rejected', async () => {
      // Arrange
      let expectedException = 'pita exception';

      gitMock.setRejectedReadFileMock(expectedException);

      // Act & Assert
      const tags = await tagsRepo.getTags();
      expect(tags).to.eql([]);
    });
  });
});

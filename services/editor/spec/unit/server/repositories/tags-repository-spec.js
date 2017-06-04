/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../server/repositories/tags-repository');

import TagsRepository from '../../../../server/repositories/tags-repository';

describe('TagsRepository', () => {
  let mockGitRepo = {};
  let mockTransactionManager = {
    write: function (action) {
      return action(mockGitRepo);
    },
    read: function (action) {
      return action(mockGitRepo);
    },
  };
  let target = new TagsRepository(mockTransactionManager);

  const testAuthor = { name: 'some name', email: 'some email' };
  const testTags = `[
    {"name":"tag1"},
    {"name":"tag2"}
  ]`;

  beforeEach(() => {
    mockGitRepo = {};
  });

  describe('getTags', () => {
    it('should parse and return tags as an array', async () => {
      // Arrange
      mockGitRepo.readFile = jest.fn(path => testTags);

      // Act
      let tags = await target.getTags();

      // Assert
      expect(tags).toEqual([{ name: 'tag1' }, { name: 'tag2' }]);
    });

    it('should read the tags from the tags.json file', async () => {
      // Arrange
      mockGitRepo.readFile = jest.fn(path => testTags);

      // Act
      let tags = await target.getTags();

      // Assert
      expect(mockGitRepo.readFile.mock.calls[0][0]).toEqual('tags.json');
    });
  });

  describe('mergeTags', () => {
    beforeEach(() => {
      mockGitRepo.readFile = jest.fn(path => testTags);
      mockGitRepo.updateFile = jest.fn();
      mockGitRepo.commitAndPush = jest.fn();
      mockGitRepo.pull = jest.fn();
    });

    it('should merge new tags with the existing tags', async () => {
      // Arrange

      // Act
      await target.mergeTags(['tag2', 'tag3'], testAuthor);

      // Assert
      expect(mockGitRepo.updateFile.mock.calls[0][1]).toEqual(
        JSON.stringify([{ name: 'tag1' }, { name: 'tag2' }, { name: 'tag3' }], null, 4),
      );
    });

    it('should save the resulting tags into tags.json', async () => {
      // Arrange

      // Act
      await target.mergeTags(['tag2', 'tag3'], testAuthor);

      // Assert
      expect(mockGitRepo.updateFile.mock.calls[0][0]).toEqual('tags.json');
    });

    it('should commit and push using the author sent', async () => {
      // Arrange

      // Act
      await target.mergeTags(['tag2', 'tag3'], testAuthor);

      // Assert
      expect(mockGitRepo.commitAndPush.mock.calls[0][1]).toEqual(testAuthor);
    });
  });
});

/* global describe, it, before, after, beforeEach, afterEach */
import * as Mocha from 'mocha';
import TagsRepository from '../src/repositories/tags-repository';
const chai = require('chai');
const simple = require('simple-mock');

const expect = chai.expect;

describe('TagsRepository', () => {
  let mockGitRepo = <any>{};
  const mockTransactionManager = {
    with: function(action) {
      return action(mockGitRepo);
    },
    write: function(action) {
      return action(mockGitRepo);
    },
    read: function(action) {
      return action(mockGitRepo);
    },
  };
  const target = new TagsRepository(<any>mockTransactionManager);

  const testAuthor = { name: 'some name', email: 'some email' };
  const testTags = `[
    {"name":"tag1"},
    {"name":"tag2"}
  ]`;

  beforeEach(() => {
    mockGitRepo = <any>{};
  });

  describe('getTags', () => {
    beforeEach(() => {
      mockGitRepo.readFile = simple.stub().returnWith(testTags);
    });

    it('should parse and return tags as an array', async () => {
      // Act
      const tags = await target.getTags();

      // Assert
      expect(tags).to.deep.equal([{ name: 'tag1' }, { name: 'tag2' }]);
    });

    it('should read the tags from the tags.json file', async () => {
      // Act
      await target.getTags();

      // Assert
      expect(mockGitRepo.readFile.calls[0].arg).to.equal('tags.json');
    });
  });

  describe('mergeTags', () => {
    beforeEach(() => {
      mockGitRepo.readFile = simple.stub().returnWith(testTags);
      mockGitRepo.updateFile = simple.stub();
      mockGitRepo.commitAndPush = simple.stub();
      mockGitRepo.pull = simple.stub();
    });

    it('should merge new tags with the existing tags', async () => {
      // Act
      await target.mergeTags(['tag2', 'tag3'], testAuthor);

      // Assert
      const expected = [
        'tags.json',
        JSON.stringify([{ name: 'tag1' }, { name: 'tag2' }, { name: 'tag3' }], null, 4),
      ];
      expect(mockGitRepo.updateFile.calls[0].args).to.deep.equal(expected);
    });

    it('should commit and push using the author sent', async () => {
      // Act
      await target.mergeTags(['tag2', 'tag3'], testAuthor);

      // Assert
      expect(mockGitRepo.commitAndPush.calls[0].args[1]).to.deep.equal(testAuthor);
    });
  });
});

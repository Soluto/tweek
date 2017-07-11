/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../server/repositories/keys-repository');

import KeysRepository from '../../../../server/repositories/keys-repository';

describe('keys-repository', () => {
  let mockGitRepo = {};
  const mockTransactionManager = {
    write(action) {
      return action(mockGitRepo);
    },
    read(action) {
      return action(mockGitRepo);
    },
    with(action) {
      return action(mockGitRepo);
    },
  };
  const target = new KeysRepository(mockTransactionManager);

  const testAuthor = { name: 'some name', email: 'some email' };
  const testKeyPath = 'tests/key';

  beforeEach(() => {
    mockGitRepo = {};
  });

  describe('getAllKeys', () => {
    it('Should return all rule files from git after removing base path and extensions', async () => {
      // Arrange
      mockGitRepo.listFiles = jest.fn(() => ['test/key1.json', 'test/key2.json', 'key3.json']);

      // Act
      const keys = await target.getAllKeys();

      // Assert
      expect(mockGitRepo.listFiles.mock.calls[0][0]).toBe('meta');
      expect(keys).toContain('test/key1');
      expect(keys).toContain('test/key2');
      expect(keys).toContain('key3');
    });
  });

  describe('updateKey', () => {
    const testManifest = {
      key_path: testKeyPath,
      implementation: { type: 'file', format: 'jpad' },
    };
    const testRulesSource = 'rulesSource';

    beforeEach(() => {
      mockGitRepo.pull = jest.fn();
      mockGitRepo.updateFile = jest.fn();
      mockGitRepo.commitAndPush = jest.fn();
    });

    it('should update files then commit and push', async () => {
      // Act
      await target.updateKey(testKeyPath, testManifest, testRulesSource, testAuthor);

      // Assert
      expect(mockGitRepo.updateFile.mock.calls.length).toBe(2);
      expect(mockGitRepo.commitAndPush.mock.calls.length).toBe(1);
    });

    it('should update the jpad rule file and the meta details file', async () => {
      // Act
      await target.updateKey(testKeyPath, testManifest, testRulesSource, testAuthor);

      // Assert
      expect(
        mockGitRepo.updateFile.mock.calls.some(
          ([path, source]) =>
            path === `meta/${testKeyPath}.json` && source === JSON.stringify(testManifest, null, 4),
        ),
      ).toBeTruthy();
      expect(
        mockGitRepo.updateFile.mock.calls.some(
          ([path, source]) => path === `rules/${testKeyPath}.jpad` && source === testRulesSource,
        ),
      ).toBeTruthy();
    });

    it('should commit and push with the author sent', async () => {
      // Act
      await target.updateKey(testKeyPath, testManifest, testRulesSource, testAuthor);

      // Assert
      expect(mockGitRepo.commitAndPush.mock.calls[0][1]).toEqual(testAuthor);
    });
  });

  describe('deleteKey', () => {
    beforeEach(() => {
      mockGitRepo.deleteFile = jest.fn();
      mockGitRepo.commitAndPush = jest.fn();
    });

    it('should pull, delete files then commit and push', async () => {
      // Act
      await target.deleteKey(testKeyPath, testAuthor);

      // Assert
      expect(mockGitRepo.deleteFile.mock.calls.length).toBe(2);
      expect(mockGitRepo.commitAndPush.mock.calls.length).toBe(1);
    });

    it('should delete the jpad rule file and the meta details file', async () => {
      // Act
      await target.deleteKey(testKeyPath, testAuthor);

      // Assert
      expect(
        mockGitRepo.deleteFile.mock.calls.some(([path]) => path === `meta/${testKeyPath}.json`),
      ).toBeTruthy();
      expect(
        mockGitRepo.deleteFile.mock.calls.some(([path]) => path === `rules/${testKeyPath}.jpad`),
      ).toBeTruthy();
    });

    it('should commit and push with the author sent', async () => {
      // Act
      await target.deleteKey(testKeyPath, testAuthor);

      // Assert
      expect(mockGitRepo.commitAndPush.mock.calls[0][1]).toEqual(testAuthor);
    });
  });

  describe('getKeyDetails', () => {
    const manifestRevisions = {
      'revision-1': {
        key_path: testKeyPath,
        meta: {
          displayName: 'test',
          description: 'desc-1',
          readonly: false,
          archived: false,
          tags: [],
        },
        implementation: {
          type: 'file',
          format: 'jpad',
        },
        valueType: 'string',
        enabled: true,
        dependencies: [],
      },
      'revision-2': {
        key_path: testKeyPath,
        meta: {
          displayName: 'test',
          description: 'desc-2',
          readonly: false,
          archived: false,
          tags: [],
        },
        implementation: {
          type: 'file',
          format: 'jpad',
        },
        valueType: 'string',
        enabled: true,
        dependencies: [],
      },
      'revision-3': {
        key_path: testKeyPath,
        meta: {
          displayName: 'test',
          description: 'desc-3',
          readonly: false,
          archived: false,
          tags: [],
        },
        implementation: {
          type: 'file',
          format: 'jpad',
        },
        valueType: 'string',
        enabled: true,
        dependencies: [],
      },
    };

    const keyRevisions = {
      'revision-1': {
        rules: [
          {
            Id: 'test',
            Matcher: {},
            Value: 'test1',
            Type: 'SingleVariant',
            valueType: '',
          },
        ],
        partitions: [],
        valueType: '',
      },
      'revision-2': {
        rules: [
          {
            Id: 'test',
            Matcher: {},
            Value: 'test2',
            Type: 'SingleVariant',
            valueType: '',
          },
        ],
        partitions: [],
        valueType: '',
      },
      'revision-3': {
        rules: [
          {
            Id: 'test',
            Matcher: {},
            Value: 'test3',
            Type: 'SingleVariant',
            valueType: '',
          },
        ],
        partitions: [],
        valueType: '',
      },
    };
    const getKeyRevisions = revision =>
      Object.keys(keyRevisions)
        .filter(rev => JSON.parse(rev.slice(-1)) <= JSON.parse(revision.slice(-1)))
        .map(rev => ({ sha: rev }));

    beforeEach(() => {
      mockGitRepo.getHistory = jest.fn((path, { revision = 'revision-3' } = {}) =>
        getKeyRevisions(revision),
      );
      mockGitRepo.readFile = jest.fn((path, { revision = 'revision-3' } = {}) =>
        JSON.stringify(
          path.startsWith('meta') ? manifestRevisions[revision] : keyRevisions[revision],
        ),
      );
    });

    it('should return key definition with the source for the jpad', async () => {
      // Act
      const keyDetails = await target.getKeyDetails(testKeyPath);

      // Assert
      expect(keyDetails.keyDef.source).toEqual(JSON.stringify(keyRevisions['revision-3']));
      expect(keyDetails.keyDef.type).toEqual('jpad');
    });

    it('should return key definition with the source for the jpad for specified revision', async () => {
      // Act
      const keyDetails = await target.getKeyDetails(testKeyPath, { revision: 'revision-2' });

      // Assert
      expect(keyDetails.keyDef.source).toEqual(JSON.stringify(keyRevisions['revision-2']));
      expect(keyDetails.keyDef.type).toEqual('jpad');
    });

    it("should return key definition with the key's revision history", async () => {
      // Act
      const revisionHistory = await target.getKeyRevisionHistory(testKeyPath);
      // Assert
      expect(revisionHistory).toEqual(getKeyRevisions('revision-3'));
    });

    it('should parse and return manifest as an object', async () => {
      // Act
      const keyDetails = await target.getKeyDetails(testKeyPath);

      // Assert
      expect(keyDetails.manifest).toEqual(manifestRevisions['revision-3']);
    });

    it('should parse and return manifest as an object for specified revision', async () => {
      // Act
      const keyDetails = await target.getKeyDetails(testKeyPath, { revision: 'revision-2' });

      // Assert
      expect(keyDetails.manifest).toEqual(manifestRevisions['revision-2']);
    });

    it('should convert old JPAD format to new format if needed', async () => {
      // Arrange
      const metaSource = JSON.stringify({
        meta: {
          name: 'test',
          description: '',
          tags: [],
        },
        valueType: '',
        implementation: {
          type: 'file',
          format: 'jpad',
        },
      });

      const oldFormatJPAD = [
        {
          Id: 'test',
          Matcher: {},
          Value: 'test',
          Type: 'SingleVariant',
          valueType: '',
        },
      ];

      const expectedJPAD = {
        partitions: [],
        valueType: 'string',
        rules: oldFormatJPAD,
      };

      mockGitRepo.readFile = jest.fn(
        path => (path.startsWith('meta') ? metaSource : JSON.stringify(oldFormatJPAD)),
      );

      // Act
      const keyDetails = await target.getKeyDetails(testKeyPath);

      // Assert
      expect(keyDetails.keyDef.source).toEqual(JSON.stringify(expectedJPAD));
    });
  });
});

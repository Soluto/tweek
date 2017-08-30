/* global describe, it, before, after, beforeEach, afterEach */
const chai = require('chai');
const simple = require('simple-mock');
const KeysRepository = require('../src/repositories/keys-repository').default;

chai.use(require('chai-things'));
const expect = chai.expect;

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
      const expecetdKeys = ['test/key1.json', 'test/key2.json', 'key3.json'];
      mockGitRepo.listFiles = simple.stub().returnWith(expecetdKeys);

      // Act
      const keys = await target.getAllKeys();

      // Assert
      expect(mockGitRepo.listFiles.calls[0].arg).to.equal('manifests');
      expect(keys).to.deep.equal(expecetdKeys.map(key => key.replace('.json', '')));
    });
  });

  describe('updateKey', () => {
    const testManifest = {
      key_path: testKeyPath,
      implementation: { type: 'file', format: 'jpad' },
    };
    const testRulesSource = 'rulesSource';

    beforeEach(() => {
      mockGitRepo.pull = simple.stub();
      mockGitRepo.updateFile = simple.stub();
      mockGitRepo.commitAndPush = simple.stub();
    });

    it('should update files then commit and push', async () => {
      // Act
      await target.updateKey(testKeyPath, testManifest, testRulesSource, testAuthor);

      // Assert
      expect(mockGitRepo.updateFile.callCount).to.equal(2);
      expect(mockGitRepo.commitAndPush.callCount).to.equal(1);
    });

    it('should update the jpad rule file and the manifest file', async () => {
      // Act
      await target.updateKey(testKeyPath, testManifest, testRulesSource, testAuthor);

      // Assert
      const args = mockGitRepo.updateFile.calls.map(x => x.args);
      expect(args).to.include.something.that.deep.equals([
        `manifests/${testKeyPath}.json`,
        JSON.stringify(testManifest, null, 4),
      ]);
      expect(args).to.include.something.that.deep.equals([
        `implementations/jpad/${testKeyPath}.jpad`,
        testRulesSource,
      ]);
    });

    it('should commit and push with the author sent', async () => {
      // Act
      await target.updateKey(testKeyPath, testManifest, testRulesSource, testAuthor);

      // Assert
      expect(mockGitRepo.commitAndPush.calls[0].args[1]).to.equal(testAuthor);
    });
  });

  describe('deleteKey', () => {
    beforeEach(() => {
      mockGitRepo.deleteFile = simple.stub();
      mockGitRepo.commitAndPush = simple.stub();
    });

    it('should pull, delete files then commit and push', async () => {
      // Act
      await target.deleteKey(testKeyPath, testAuthor);

      // Assert
      expect(mockGitRepo.deleteFile.callCount).to.equal(2);
      expect(mockGitRepo.commitAndPush.callCount).to.equal(1);
    });

    it('should delete the jpad rule file and the manifest file', async () => {
      // Act
      await target.deleteKey(testKeyPath, testAuthor);

      // Assert
      const args = mockGitRepo.deleteFile.calls.map(x => x.arg);
      expect(args).to.include(`manifests/${testKeyPath}.json`);
      expect(args).to.include(`implementations/jpad/${testKeyPath}.jpad`);
    });

    it('should commit and push with the author sent', async () => {
      // Act
      await target.deleteKey(testKeyPath, testAuthor);

      // Assert
      expect(mockGitRepo.commitAndPush.calls[0].args[1]).to.equal(testAuthor);
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
            Salt: 'test',
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
      mockGitRepo.getHistory = simple.spy((path, { revision = 'revision-3' } = {}) =>
        getKeyRevisions(revision),
      );
      mockGitRepo.readFile = simple.spy((path, { revision = 'revision-3' } = {}) =>
        JSON.stringify(
          path.startsWith('manifests') ? manifestRevisions[revision] : keyRevisions[revision],
        ),
      );
    });

    it('should return key definition with the source for the jpad', async () => {
      // Act
      const keyDetails = await target.getKeyDetails(testKeyPath);
      expect(keyDetails.implementation).to.deep.include(JSON.stringify(keyRevisions['revision-3']));
    });

    it('should return key definition with the source for the jpad for specified revision', async () => {
      // Act
      const keyDetails = await target.getKeyDetails(testKeyPath, { revision: 'revision-2' });

      expect(keyDetails.implementation).to.deep.include(JSON.stringify(keyRevisions['revision-2']));
    });

    it("should return key definition with the key's revision history", async () => {
      // Act
      const revisionHistory = await target.getKeyRevisionHistory(testKeyPath);
      // Assert
      expect(revisionHistory).to.deep.equal(getKeyRevisions('revision-3'));
    });

    it('should parse and return manifest as an object', async () => {
      // Act
      const keyDetails = await target.getKeyDetails(testKeyPath);

      // Assert
      expect(keyDetails.manifest).to.deep.equal(manifestRevisions['revision-3']);
    });

    it('should parse and return manifest as an object for specified revision', async () => {
      // Act
      const keyDetails = await target.getKeyDetails(testKeyPath, { revision: 'revision-2' });

      // Assert
      expect(keyDetails.manifest).to.deep.equal(manifestRevisions['revision-2']);
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

      mockGitRepo.readFile = simple.spy(
        path => (path.startsWith('manifests') ? metaSource : JSON.stringify(oldFormatJPAD)),
      );

      // Act
      const keyDetails = await target.getKeyDetails(testKeyPath);

      // Assert
      expect(keyDetails.implementation).to.equal(JSON.stringify(expectedJPAD));
    });
  });
});

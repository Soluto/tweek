/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../modules/server/repositories/keys-repository');

import KeysRepository from '../../../../modules/server/repositories/keys-repository';

describe("keys-repository", () => {

  let mockGitRepo = {};
  let mockTransactionManager = {
    write: function (action) { return action(mockGitRepo); },
    read: function (action) { return action(mockGitRepo); }
  };
  let target = new KeysRepository(mockTransactionManager);

  const testAuthor = { name: 'some name', email: 'some email' };
  const testKeyPath = "tests/key";

  beforeEach(() => {
    mockGitRepo = {};
  });

  describe("getAllKeys", () => {

    it("Should return all rule files from git after removing base path and extensions", async () => {
      // Arrange
      mockGitRepo.listFiles = jest.fn(() => [
        'test/key1.jpad',
        'test/key2.jpad',
        'key3.jpad'
      ]);

      // Act
      const keys = await target.getAllKeys();

      // Assert
      expect(mockGitRepo.listFiles.mock.calls[0][0]).toBe("rules");
      expect(keys).toContain("test/key1");
      expect(keys).toContain("test/key2");
      expect(keys).toContain("key3");
    });
  });

  describe("updateKey", () => {

    const testMetaSource = "metaSource";
    const testRulesSource = "rulesSource";

    beforeEach(() => {
      mockGitRepo.pull = jest.fn();
      mockGitRepo.updateFile = jest.fn();
      mockGitRepo.commitAndPush = jest.fn();
    });

    it("should update files then commit and push", async () => {
      // Act
      await target.updateKey(testKeyPath, testMetaSource, testRulesSource, testAuthor);

      // Assert
      expect(mockGitRepo.updateFile.mock.calls.length).toBe(2);
      expect(mockGitRepo.commitAndPush.mock.calls.length).toBe(1);
    });

    it("should update the jpad rule file and the meta details file", async () => {
      // Act
      await target.updateKey(testKeyPath, testMetaSource, testRulesSource, testAuthor);

      // Assert
      expect(mockGitRepo.updateFile.mock.calls.some(([path, source]) => path == `meta/${testKeyPath}.json` && source == testMetaSource)).toBeTruthy();
      expect(mockGitRepo.updateFile.mock.calls.some(([path, source]) => path == `rules/${testKeyPath}.jpad` && source == testRulesSource)).toBeTruthy();
    });

    it("should commit and push with the author sent", async () => {
      // Act
      await target.updateKey(testKeyPath, testMetaSource, testRulesSource, testAuthor);

      // Assert
      expect(mockGitRepo.commitAndPush.mock.calls[0][1]).toEqual(testAuthor);
    })
  });

  describe("deleteKey", () => {

    beforeEach(() => {
      mockGitRepo.deleteFile = jest.fn();
      mockGitRepo.commitAndPush = jest.fn();
    });

    it("should pull, delete files then commit and push", async () => {
      // Act
      await target.deleteKey(testKeyPath, testAuthor);

      // Assert
      expect(mockGitRepo.deleteFile.mock.calls.length).toBe(2);
      expect(mockGitRepo.commitAndPush.mock.calls.length).toBe(1);
    });

    it("should delete the jpad rule file and the meta details file", async () => {
      // Act
      await target.deleteKey(testKeyPath, testAuthor);

      // Assert
      expect(mockGitRepo.deleteFile.mock.calls.some(([path]) => path == `meta/${testKeyPath}.json`)).toBeTruthy();
      expect(mockGitRepo.deleteFile.mock.calls.some(([path]) => path == `rules/${testKeyPath}.jpad`)).toBeTruthy();
    });

    it("should commit and push with the author sent", async () => {
      // Act
      await target.deleteKey(testKeyPath, testAuthor);

      // Assert
      expect(mockGitRepo.commitAndPush.mock.calls[0][1]).toEqual(testAuthor);
    })
  });

  describe("getKeyDetails", () => {

    const metaSource = JSON.stringify({
      "displayName": "test",
      "description": "",
      "tags": [],
      "valueType": "",
    });

    const rulesSource = JSON.stringify({
      Rules: [{
        "Id": "test",
        "Matcher": {},
        "Value": "test",
        "Type": "SingleVariant",
        "valueType": "",
      }],
      Partitions: [],
      ValueType: "",
    });

    const modificationData = {
      modifyDate: Date.now(),
      modifyUser: "testUser",
      modifyCompareUrl: "testCompareUrl"
    };

    beforeEach(() => {
      mockGitRepo.getFileDetails = jest.fn(path => modificationData);
      mockGitRepo.readFile = jest.fn(path => path.startsWith("meta") ? metaSource : rulesSource);
    });

    it("should return key definition with the source for the jpad", async () => {
      // Act
      let keyDetails = await target.getKeyDetails(testKeyPath);

      // Assert
      expect(keyDetails.keyDef.source).toEqual(rulesSource);
      expect(keyDetails.keyDef.type).toEqual("jpad");
    });

    it("should return key definition with the key's rules history", async () => {
      // Act
      let keyDetails = await target.getKeyDetails(testKeyPath);

      // Assert
      expect(keyDetails.keyDef.modificationData).toEqual(modificationData);
    });

    it("should parse and return meta as an object", async () => {
      // Act
      let keyDetails = await target.getKeyDetails(testKeyPath);

      // Assert
      expect(keyDetails.meta).toEqual(JSON.parse(metaSource));
    });

    it("should convert old JPAD format to new format if needed", async () => {
      // Arrange
      const oldFormatJPAD = [{
        "Id": "test",
        "Matcher": {},
        "Value": "test",
        "Type": "SingleVariant",
        "valueType": "",
      }];

      const expecteJPAD = {
        Partitions: [],
        ValueType: "string",
        Rules: oldFormatJPAD,
      };

      mockGitRepo.readFile = jest.fn(path => path.startsWith("meta") ? metaSource : JSON.stringify(oldFormatJPAD));

      // Act
      let keyDetails = await target.getKeyDetails(testKeyPath);

      // Assert
      expect(keyDetails.keyDef.source).toEqual(JSON.stringify(expecteJPAD));
    });
  })
});
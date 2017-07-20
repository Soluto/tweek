/* global describe, before, beforeEach, after, it, browser */

import KeysAsserts from '../../KeysAsserts';
import KeysPage from '../../utils/KeysPage';
import selectors from '../../selectors/keySelectors';

describe('partition key', () => {
  const testFolder = KeysPage.TEST_KEYS_FOLDER;
  const partitionsTestFolder = '@partitions';

  beforeEach(() => {
    browser.refresh();
    browser.acceptAlertIfPresent();
    KeysPage.waitForKeyToLoad()
  });

  describe('add partition', () => {
    before(() => {
      browser.windowHandleMaximize();
    });

    describe('invalid partitions', () => {
      const emptyRulesKeyFullPath = `${testFolder}/${partitionsTestFolder}/empty_partition`;
      before(() => {
        KeysPage.goToKey(emptyRulesKeyFullPath);
      });

      it('should not allow invalid properties', () => {
        KeysPage.addPartitionFromProperty('someInvalidValue');
        browser.waitForVisible(selectors.ALERT_OK_BUTTON, 1000);
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000, true);
      });

      it('should not allow duplicate properties', () => {
        KeysPage.addPartitionFromProperty('user.FavoriteFruit');
        browser.waitForVisible(selectors.ALERT_OK_BUTTON, 1000, true);
        KeysPage.addPartitionFromProperty('user.FavoriteFruit');
        browser.waitForVisible(selectors.ALERT_OK_BUTTON, 1000);
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000, true);
      });
    });

    describe('valid partitions', () => {
      const addPartitionKeyFullPath = `${testFolder}/${partitionsTestFolder}/add_partition`;
      before(() => {
        KeysPage.goToKey(addPartitionKeyFullPath);
      });

      it('should not partition if canceled', () => {
        const keySource = KeysPage.getKeySource();
        KeysPage.addPartitionFromProperty('user.FavoriteFruit');
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
        browser.click(selectors.ALERT_CANCEL_BUTTON);
        KeysAsserts.assertKeySource(keySource);
      });

      it('should auto-partition correctly if auto-partition was selected', () => {
        KeysPage.addPartitionFromProperty('user.FavoriteFruit');
        browser.clickWhenVisible(selectors.AUTO_PARTITION_BUTTON, 1000);
        KeysAsserts.assertKeySource({
          partitions: ["user.FavoriteFruit"],
          valueType: "string",
          rules: {
            "*": [
              {
                Matcher: {
                  "user.AgentVersion": {
                    "$ge": "0.12.3",
                    "$compare": "version"
                  }
                },
                Value: "agentValue",
                Type: "SingleVariant"
              },
              {
                Matcher: {"user.Gender": "female"},
                Value: "femaleValue",
                Type: "SingleVariant"
              },
              {
                Matcher: {},
                Value: "defaultValue",
                Type: "SingleVariant"
              }
            ],
            "Apple": [
              {
                Matcher: {},
                Value: "appleValue",
                Type: "SingleVariant"
              }
            ]
          }
        });
      });

      it('should not allow auto-partition if matcher is invalid', () => {
        KeysPage.addPartitionFromProperty('user.FavoriteFruit');
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
        browser.waitForVisible(selectors.AUTO_PARTITION_BUTTON, 1000, false);

        browser.waitForVisible(selectors.RESET_PARTITIONS_BUTTON, 1000);
        browser.click(selectors.RESET_PARTITIONS_BUTTON);
        KeysAsserts.assertKeySource({
          partitions: ["user.FavoriteFruit"],
          valueType: "string",
          rules: {}
        });
      });
    });
  });

  describe('delete partition', () => {
    const deletePartitionKeyFullPath = `${testFolder}/${partitionsTestFolder}/delete_partition`;
    before(() => {
      KeysPage.goToKey(deletePartitionKeyFullPath);
    });

    it('should clear rules after partition is deleted', () => {
      browser.click(selectors.partitionDeleteButton(1));
      browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
      KeysPage.acceptRodalIfRaised();
      KeysAsserts.assertKeySource({
        partitions: [],
        valueType: "string",
        rules: []
      });
    });
  });

  describe('partition groups', () => {
    it('should add new partition group', () => {
      KeysPage.goToKey(`${testFolder}/${partitionsTestFolder}/add_partition_group`);
      const newPartitionGroups = [['Banana'], ['Orange', 'Rick'], [false, 'Morty']];
      newPartitionGroups.forEach((group) => {
        group.forEach((value, i) => {
          if (value) browser.setValue(selectors.newPartitionGroupInput(i + 1), value);
        });
        browser.click(selectors.ADD_PARTITION_GROUP_BUTTON);
      });
      KeysAsserts.assertKeySource({
        partitions: ["user.FavoriteFruit", "user.FatherName"],
        valueType: "string",
        rules: {
          "Banana": {
            "*": []
          },
          "Orange": {
            "Rick": []
          },
          "*": {
            "Morty": []
          }
        }
      });
    });

    it('should delete group rules when deleting partition group', () => {
      KeysPage.goToKey(`${testFolder}/${partitionsTestFolder}/partition_groups`);
      browser.click(selectors.partitionGroupDeleteButton(2));
      browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
      KeysPage.acceptRodalIfRaised();
      KeysAsserts.assertKeySource({
        partitions: ["user.FavoriteFruit", "user.Gender"],
        valueType: "string",
        rules: {
          "Banana": {
            "male": [
              {
                Matcher: {},
                Value: "someValue",
                Type: "SingleVariant"
              }
            ]
          },
          "*": {
            "*": [
              {
                Matcher: {},
                Value: "otherDefaultValue",
                Type: "SingleVariant"
              }
            ]
          }
        }
      })
    });
  });
});
/* global describe, before, beforeEach, after, it, browser */

import KeysAsserts from '../../KeysAsserts';
import KeysPageObject from '../../KeysPageObject';
import {selectors} from '../../selectors';

describe('partition key', () => {
  const keysPageObject = new KeysPageObject(browser);
  const keysAsserts = new KeysAsserts(keysPageObject, browser);

  const testFolder = KeysPageObject.TEST_KEYS_FOLDER;
  const partitionsTestFolder = '@partitions';

  beforeEach(() => {
    browser.refresh();
    browser.acceptAlertIfPresent();
    keysPageObject.waitForKeyToLoad()
  });

  describe('add partition', () => {
    before(() => {
      browser.windowHandleMaximize();
    });

    describe('invalid partitions', () => {
      const emptyRulesKeyFullPath = `${testFolder}/${partitionsTestFolder}/empty_partition`;

      before(() => {
        keysPageObject.goToKey(emptyRulesKeyFullPath);
      });

      it('should not allow invalid properties', () => {
        keysPageObject.addPartitionFromProperty('someInvalidValue');
        browser.waitForVisible(selectors.ALERT_OK_BUTTON, 1000);
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000, true);
      });

      it('should not allow duplicate properties', () => {
        keysPageObject.addPartitionFromProperty('user.FavoriteFruit');
        browser.waitForVisible(selectors.ALERT_OK_BUTTON, 1000, true);
        keysPageObject.addPartitionFromProperty('user.FavoriteFruit');
        browser.waitForVisible(selectors.ALERT_OK_BUTTON, 1000);
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000, true);
      });
    });

    describe('valid partitions', () => {
      const addPartitionKeyFullPath = `${testFolder}/${partitionsTestFolder}/add_partition`;

      before(() => {
        keysPageObject.goToKey(addPartitionKeyFullPath);
      });

      it('should show alert when rules are not empty', () => {
        keysPageObject.addPartitionFromSuggestion('favorite');
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
      });

      it('should not partition if canceled', () => {
        const keySource = keysPageObject.getKeySource();
        keysPageObject.addPartitionFromSuggestion('favorite');
        browser.clickWhenVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
        keysAsserts.assertKeySource(keySource);
      });

      it('should auto-partition correctly if auto-partition was selected', () => {
        keysPageObject.addPartitionFromProperty('user.FavoriteFruit');
        browser.clickWhenVisible(selectors.AUTO_PARTITION_BUTTON, 1000);
        keysAsserts.assertKeySource({
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
        keysPageObject.addPartitionFromProperty('user.FavoriteFruit');
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
        browser.waitForVisible(selectors.AUTO_PARTITION_BUTTON, 1000, false);
      });

      it('should reset partitions if reset was selected', () => {
        keysPageObject.addPartitionFromProperty('user.FavoriteFruit');
        browser.clickWhenVisible(selectors.RESET_PARTITIONS_BUTTON, 1000);
        keysAsserts.assertKeySource({
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
      keysPageObject.goToKey(deletePartitionKeyFullPath);
    });

    it('should show alert when rules are not empty', () => {
      browser.click(selectors.partitionDeleteButton(1));
      browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
    });

    it('should clear rules after partition is deleted', () => {
      browser.click(selectors.partitionDeleteButton(1));
      browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
      keysPageObject.acceptRodalIfRaised();
      keysAsserts.assertKeySource({
        partitions: [],
        valueType: "string",
        rules: []
      });
    });
  });

  describe('partition groups', () => {

    describe('add', () => {
      const addPartitionGroupFullPath = `${testFolder}/${partitionsTestFolder}/add_partition_group`;

      before(() => {
        keysPageObject.goToKey(addPartitionGroupFullPath);
      });

      it('should add new partition group', () => {
        const newPartitionGroups = [['Banana'], ['Orange', 'Rick'], [false, 'Morty']];
        newPartitionGroups.forEach((group) => {
          group.forEach((value, i) => {
            if (value) browser.setValue(selectors.newPartitionGroupInput(i + 1), value);
          });
          browser.click(selectors.ADD_PARTITION_GROUP_BUTTON);
        });
        keysAsserts.assertKeySource({
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
    });

    describe('delete', () => {
      const deletePartitionKeyFullPath = `${testFolder}/${partitionsTestFolder}/partition_groups`;
      before(() => {
        keysPageObject.goToKey(deletePartitionKeyFullPath);
      });

      it('should show alert when deleting partition group', () => {
        browser.click(selectors.partitionGroupDeleteButton(1));
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
      });

      it('should delete group rules when deleting partition group', () => {
        browser.click(selectors.partitionGroupDeleteButton(2));
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
        keysPageObject.acceptRodalIfRaised();
        keysAsserts.assertKeySource({
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
});
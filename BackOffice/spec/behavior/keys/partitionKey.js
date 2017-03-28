/* global describe, before, beforeEach, after, it, browser */

import KeysAsserts from '../KeysAsserts';
import KeysPageObject from '../KeysPageObject';
import {selectors} from '../selectors';

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
        keysPageObject.addPartitionFromProperty('device.DeviceType');
        browser.waitForVisible(selectors.ALERT_OK_BUTTON, 1000, true);
        keysPageObject.addPartitionFromProperty('device.DeviceType');
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
        keysPageObject.addPartitionFromSuggestion('partner');
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
      });

      it('should not partition if canceled', () => {
        const keySource = keysPageObject.getKeySource();
        keysPageObject.addPartitionFromSuggestion('partner');
        browser.clickWhenVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
        keysAsserts.assertKeySource(keySource);
      });

      it('should auto-partition correctly if auto-partition was selected', () => {
        keysPageObject.addPartitionFromProperty('device.PartnerBrandId');
        browser.clickWhenVisible(selectors.AUTO_PARTITION_BUTTON, 1000);
        keysAsserts.assertKeySource({
          partitions: ["device.PartnerBrandId"],
          valueType: "string",
          rules: {
            "*": [
              {
                Matcher: {
                  "device.AgentVersion": {
                    "$ge": "0.12.3",
                    "$compare": "version"
                  }
                },
                Value: "agentValue",
                Type: "SingleVariant"
              },
              {
                Matcher: {"device.DeviceOsType": "android"},
                Value: "osValue",
                Type: "SingleVariant"
              },
              {
                Matcher: {},
                Value: "defaultValue",
                Type: "SingleVariant"
              }
            ],
            "SomePartner": [
              {
                Matcher: {},
                Value: "partnerValue",
                Type: "SingleVariant"
              }
            ]
          }
        });
      });

      it('should not allow auto-partition if matcher is invalid', () => {
        keysPageObject.addPartitionFromProperty('device.PartnerBrandId');
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
        browser.waitForVisible(selectors.AUTO_PARTITION_BUTTON, 1000, false);
      });

      it('should reset partitions if reset was selected', () => {
        keysPageObject.addPartitionFromProperty('device.PartnerBrandId');
        browser.clickWhenVisible(selectors.RESET_PARTITIONS_BUTTON, 1000);
        keysAsserts.assertKeySource({
          partitions: ["device.PartnerBrandId"],
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
      let keyFullPath;

      before(() => {
        const keyName = keysPageObject.generateTestKeyName('add_partition_group');
        keyFullPath = `${testFolder}/${partitionsTestFolder}/${keyName}`;
        keysPageObject.goToBase();
        keysPageObject.addEmptyKey(keyFullPath);
        keysPageObject.addPartitionFromProperty('device.PartnerBrandId');
        keysPageObject.addPartitionFromProperty('device.DeviceVendor');
        keysPageObject.saveChanges();
      });

      after(() => {
        keysPageObject.deleteKeyIfExists(keyFullPath);
      });

      it('should add new partition group', () => {
        const newPartitionGroups = [['newPartner1'], ['newPartner2', 'LG'], [false, 'Google']];
        newPartitionGroups.forEach((group) => {
          group.forEach((value, i) => {
            if (value) browser.setValue(selectors.newPartitionGroupInput(i + 1), value);
          });
          browser.click(selectors.ADD_PARTITION_GROUP_BUTTON);
        });
        keysAsserts.assertKeySource({
          partitions: ["device.PartnerBrandId", "device.DeviceVendor"],
          valueType: "string",
          rules: {
            "newPartner1": {
              "*": []
            },
            "newPartner2": {
              "LG": []
            },
            "*": {
              "Google": []
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
          partitions: ["device.PartnerBrandId", "device.DeviceVendor"],
          valueType: "string",
          rules: {
            "SomePartner": {
              "Samsung": [
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
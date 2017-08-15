/* global describe, before, beforeEach, after, it, browser */

import { expect } from 'chai';
import Key from '../../utils/Key';
import Alert from '../../utils/Alert';
import { dataComp } from '../../utils/selector-utils';
import selectors from '../../selectors/keySelectors';

function addPartition(property) {
  browser.setValue(`${dataComp('partition-selector')} input`, `${property}\n`);
}

describe('partition key', () => {
  const testFolder = '@behavior_tests';
  const partitionsTestFolder = '@partitions';

  beforeEach(() => {
    browser.refresh();
    Key.waitToLoad();
  });

  describe('add partition', () => {
    describe('invalid partitions', () => {
      const emptyRulesKeyFullPath = `${testFolder}/${partitionsTestFolder}/empty_partition`;
      before(() => {
        Key.open(emptyRulesKeyFullPath);
      });

      it('should not allow invalid properties', () => {
        addPartition('someInvalidValue');
        browser.waitForVisible(selectors.ALERT_OK_BUTTON, 1000);
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000, true);
      });

      it('should not allow duplicate properties', () => {
        addPartition('user.FavoriteFruit');
        browser.waitForVisible(selectors.ALERT_OK_BUTTON, 1000, true);
        addPartition('user.FavoriteFruit');
        browser.waitForVisible(selectors.ALERT_OK_BUTTON, 1000);
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000, true);
      });
    });

    describe('valid partitions', () => {
      const addPartitionKeyFullPath = `${testFolder}/${partitionsTestFolder}/add_partition`;
      before(() => {
        Key.open(addPartitionKeyFullPath);
      });

      it('should not partition if canceled', () => {
        const keySource = Key.source;
        addPartition('user.FavoriteFruit');
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
        browser.click(selectors.ALERT_CANCEL_BUTTON);
        expect(Key.source).to.deep.equal(keySource);
      });

      it('should auto-partition correctly if auto-partition was selected', () => {
        addPartition('user.FavoriteFruit');
        browser.clickWhenVisible(selectors.AUTO_PARTITION_BUTTON, 1000);

        expect(Key.source).to.deep.equal({
          partitions: ['user.FavoriteFruit'],
          valueType: 'string',
          rules: {
            '*': [
              {
                Matcher: {
                  'user.AgentVersion': {
                    $ge: '0.12.3',
                    $compare: 'version',
                  },
                },
                Value: 'agentValue',
                Type: 'SingleVariant',
              },
              {
                Matcher: { 'user.Gender': 'female' },
                Value: 'femaleValue',
                Type: 'SingleVariant',
              },
              {
                Matcher: {},
                Value: 'defaultValue',
                Type: 'SingleVariant',
              },
            ],
            Apple: [
              {
                Matcher: {},
                Value: 'appleValue',
                Type: 'SingleVariant',
              },
            ],
          },
        });
      });

      it('should not allow auto-partition if matcher is invalid', () => {
        addPartition('user.FavoriteFruit');
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 1000);
        browser.waitForVisible(selectors.AUTO_PARTITION_BUTTON, 1000, false);

        browser.waitForVisible(selectors.RESET_PARTITIONS_BUTTON, 1000);
        browser.click(selectors.RESET_PARTITIONS_BUTTON);
        expect(Key.source).to.deep.equal({
          partitions: ['user.FavoriteFruit'],
          valueType: 'string',
          rules: {},
        });
      });
    });
  });

  describe('delete partition', () => {
    const deletePartitionKeyFullPath = `${testFolder}/${partitionsTestFolder}/delete_partition`;

    it('should clear rules after partition is deleted', () => {
      Key.open(deletePartitionKeyFullPath);
      browser.click(selectors.partitionDeleteButton(1));
      Alert.ok();
      expect(Key.source).to.deep.equal({
        partitions: [],
        valueType: 'string',
        rules: [],
      });
    });
  });

  describe('partition groups', () => {
    it('should add new partition group', () => {
      Key.open(`${testFolder}/${partitionsTestFolder}/add_partition_group`);
      const newPartitionGroups = [['Banana'], ['Orange', 'Rick'], [false, 'Morty']];
      newPartitionGroups.forEach(group => {
        group.forEach((value, i) => {
          if (value) browser.setValue(selectors.newPartitionGroupInput(i + 1), value);
        });
        browser.click(selectors.ADD_PARTITION_GROUP_BUTTON);
      });
      expect(Key.source).to.deep.equal({
        partitions: ['user.FavoriteFruit', 'user.FatherName'],
        valueType: 'string',
        rules: {
          Banana: {
            '*': [],
          },
          Orange: {
            Rick: [],
          },
          '*': {
            Morty: [],
          },
        },
      });
    });

    it('should delete group rules when deleting partition group', () => {
      Key.open(`${testFolder}/${partitionsTestFolder}/partition_groups`);
      browser.click(selectors.partitionGroupDeleteButton(2));
      Alert.ok();
      expect(Key.source).to.deep.equal({
        partitions: ['user.FavoriteFruit', 'user.Gender'],
        valueType: 'string',
        rules: {
          Banana: {
            male: [
              {
                Matcher: {},
                Value: 'someValue',
                Type: 'SingleVariant',
              },
            ],
          },
          '*': {
            '*': [
              {
                Matcher: {},
                Value: 'otherDefaultValue',
                Type: 'SingleVariant',
              },
            ],
          },
        },
      });
    });
  });
});

/* global describe, before, beforeEach, after, it, browser */

import { expect } from 'chai';
import Key from '../../utils/Key';
import Alert from '../../utils/Alert';
import { attributeSelector, dataComp, dataField, nthSelector } from '../../utils/selector-utils';

function addPartition(property) {
  browser.setValue(`${dataComp('partition-selector')} input`, `${property}\n`);
}

const testFolder = 'behavior_tests/partitions';

const partitionSelector = (className, index) =>
  nthSelector(index, `${dataComp('partition-selector')} .${className}`);
const newPartition = selector => `${dataComp('new-partition')} ${selector}`;
const newPartitionPropertyValue = property => newPartition(dataField(property));
const partitionGroup = partitionValues =>
  dataComp('partition-group') +
  attributeSelector('data-group', partitionValues.join(', ').toLowerCase());

describe('partition key', () => {
  describe('add partition', () => {
    describe('invalid partitions', () => {
      beforeEach(() => {
        Key.open(`${testFolder}/empty_partition`);
      });

      it('should not allow invalid properties', () => {
        addPartition('someInvalidValue');
        Alert.waitFor('ok');
        Alert.waitFor('cancel', true);
      });

      it('should not allow duplicate properties', () => {
        addPartition('user.FavoriteFruit');

        Alert.waitFor('ok', true);

        addPartition('user.FavoriteFruit');

        Alert.waitFor('ok');
        Alert.waitFor('cancel', true);
      });
    });

    describe('valid partitions', () => {
      beforeEach(() => {
        Key.open(`${testFolder}/add_partition`);
      });

      it('should not partition if canceled', () => {
        const keySource = Key.goToSourceTab().source;
        Key.goToRulesTab();
        addPartition('user.FavoriteFruit');
        Alert.cancel();
        expect(Key.goToSourceTab().source).to.deep.equal(keySource);
      });

      it('should auto-partition correctly if auto-partition was selected', () => {
        addPartition('user.FavoriteFruit');
        Alert.click('auto-partition');

        expect(Key.goToSourceTab().source).to.deep.equal({
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
        addPartition('user.AgentVersion');
        Alert.waitFor('cancel');
        Alert.waitFor('auto-partition', true);

        Alert.click('ok');
        expect(Key.goToSourceTab().source).to.deep.equal({
          partitions: ['user.AgentVersion'],
          valueType: 'string',
          rules: {},
        });
      });
    });
  });

  describe('delete partition', () => {
    it('should clear rules after partition is deleted', () => {
      Key.open(`${testFolder}/delete_partition`);

      browser.click(partitionSelector('tag-delete-button', 1));
      Alert.ok();

      expect(Key.goToSourceTab().source).to.deep.equal({
        partitions: [],
        valueType: 'string',
        rules: [],
      });
    });
  });

  describe('partition groups', () => {
    it('should add new partition group', () => {
      Key.open(`${testFolder}/add_partition_group`);

      const newPartitionGroups = [
        { 'user.FavoriteFruit': 'Banana' },
        {
          'user.FavoriteFruit': 'Orange',
          'user.FatherName': 'Rick',
        },
        { 'user.FatherName': 'Morty' },
      ];

      newPartitionGroups.forEach(group => {
        Object.entries(group).forEach(([property, value]) => {
          $(newPartitionPropertyValue(property)).setValue(value);
        });

        browser.click(newPartition(dataComp('add-partition')));
      });
      expect(Key.goToSourceTab().source).to.deep.equal({
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
      Key.open(`${testFolder}/partition_groups`);

      const deleteGroupButton = `${partitionGroup(['banana', 'default'])} ${dataComp(
        'delete-partition-group',
      )}`;
      browser.click(deleteGroupButton);

      Alert.ok();

      expect(Key.goToSourceTab().source).to.deep.equal({
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

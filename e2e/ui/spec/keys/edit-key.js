/* global describe, before, after, it, browser */

import { expect } from 'chai';
import Key from '../../utils/Key';
import Rule from '../../utils/Rule';
import Alert from '../../utils/Alert';
import { dataComp, attributeSelector } from '../../utils/selector-utils';
import tweekApiClient from '../../clients/tweek-api-client';
import authoringApi from '../../clients/authoring-client';
import { login } from '../../utils/auth-utils';

describe('edit keys', () => {
  before(() => login());

  describe('edit JPad keys', () => {
    const expectedKeySource = {
      partitions: [],
      valueType: 'string',
      rules: [
        {
          Matcher: {
            'user.AgentVersion': '1.1.1',
            'user.FavoriteFruit': 'Banana',
            'user.BirthDate': {
              $withinTime: '3d',
              $compare: 'date',
            },
            'user.IsInGroup': false,
            'user.NumberOfSiblings': 1,
            'user.SiblingNames': {
              $contains: ['mark'],
            },
            'user.Identities': {
              $contains: [1, 2],
            },
            'unknown.identity': 'value',
          },
          Value: '',
          Type: 'SingleVariant',
        },
        {
          Matcher: {},
          Value: 'some value',
          Type: 'SingleVariant',
        },
      ],
      defaultValue: 'some default value',
    };

    describe('visual editor', () => {
      it('should succeed editing JPad key', () => {
        const keyName = 'behavior_tests/edit_key/visual/edit_test';
        Key.open(keyName).setDefaultValue('some default value');

        Rule.add()
          .removeCondition()
          .setValue('some value');

        Rule.add()
          .setCondition('user.AgentVersion', '1.1.1')
          .setCondition('user.FavoriteFruit', 'Banana')
          .setCondition('user.BirthDate', '3d')
          .setCondition('user.IsInGroup', 'false')
          .setCondition('user.NumberOfSiblings', '1')
          .setCondition('user.SiblingNames', ['mark', 'temp'])
          .setCondition('user.Identities', [1, 'temp', 2])
          .setCondition('unknown.identity', 'value');

        expect(Rule.count()).to.equal(2);
        expect(Key.goToSourceTab().source).to.deep.equal(expectedKeySource);

        Key.commitChanges();

        authoringApi.eventuallyExpectKey(keyName, ({ implementation }) =>
          expect(JSON.parse(implementation)).to.deep.equal(expectedKeySource),
        );
      });

      it('should succeed in editing an object JPad key', () => {
        const keyName = 'behavior_tests/edit_key/visual/edit_object_test';
        const defaultValue = { value: 123 };
        const expectedObjectKeySource = {
          partitions: [],
          valueType: 'object',
          rules: [],
          defaultValue,
        };

        Key.open(keyName).editObjectInEditor(JSON.stringify(defaultValue));
        Alert.save();

        expect(Key.goToSourceTab().source).to.deep.equal(expectedObjectKeySource);
      });

      it('should succeed in editing an array JPad key', () => {
        const keyName = 'behavior_tests/edit_key/visual/edit_array_test';
        const defaultValue = ['val', 'test'];
        const expectedObjectKeySource = {
          partitions: [],
          valueType: 'array',
          rules: [],
          defaultValue,
        };

        Key.open(keyName).editObjectInEditor(JSON.stringify(defaultValue));
        Alert.save();

        expect(Key.goToSourceTab().source).to.deep.equal(expectedObjectKeySource);
      });
    });

    describe('text editor', () => {
      it('should succeed editing JPad source', () => {
        Key.open('behavior_tests/edit_key/text/edit_test').goToSourceTab();

        Key.goToSourceTab().source = JSON.stringify(expectedKeySource, null, 4);

        Key.goToRulesTab();

        Rule.select().waitForVisible();

        expect(Key.goToSourceTab().source).to.deep.equal(expectedKeySource);

        Key.goToSourceTab().source = 'invalid json';

        Key.goToRulesTab();
        Alert.ok();

        Rule.select().waitForVisible();
        expect(Key.goToSourceTab().source).to.deep.equal(expectedKeySource);
      });
    });
  });

  describe('edit const keys', () => {
    const constKeyFolder = 'behavior_tests/edit_key/visual/const';
    const constEditor = dataComp('const-editor');

    it('should succeed editing key (valueType=number)', () => {
      const keyName = `${constKeyFolder}/number_type`;
      Key.open(keyName);
      browser.setValue(`${constEditor} input`, '30');
      Key.commitChanges();
      tweekApiClient.waitForKeyToEqual(keyName, 30);
    });

    it('should succeed editing key (valueType=string)', () => {
      const keyName = `${constKeyFolder}/string_type`;
      Key.open(keyName);
      browser.setValue(`${constEditor} input`, 'world');
      Key.commitChanges();
      tweekApiClient.waitForKeyToEqual(keyName, 'world');
    });

    it('should succeed editing key (valueType=object)', () => {
      const keyName = `${constKeyFolder}/object_type`;
      const objectValue = { boolProp: false };
      Key.open(keyName).editObjectInEditor(JSON.stringify(objectValue));
      Alert.save();
      Key.commitChanges();
      tweekApiClient.waitForKeyToEqual(keyName, objectValue);
    });

    it('should succeed editing key (valueType=date)', () => {
      const desiredDate = '2018-10-11T00:00:00.000';
      const desiredDateFormatted = '10/11/2018 00:00:00'
      const keyName = `${constKeyFolder}/date_type`;
      Key.open(keyName);
      browser.click(`${constEditor} input`);
      browser.clickWhenVisible(attributeSelector('datetime', desiredDate));
      Key.commitChanges();
      tweekApiClient.waitForKeyToEqual(keyName, desiredDateFormatted);
    });
  });
});

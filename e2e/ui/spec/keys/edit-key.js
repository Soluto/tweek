/* global describe, before, after, it, browser */

import { expect } from 'chai';
import Key from '../../utils/Key';
import Rule from '../../utils/Rule';
import Alert from '../../utils/Alert';
import { dataComp } from '../../utils/selector-utils';
import tweekApiClient from '../../clients/tweek-api-client';
import authoringApi from '../../clients/authoring-client';

describe('edit keys', () => {
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
            },
            'user.IsInGroup': false,
            'user.NumberOfSiblings': 1,
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

        Rule.add().removeCondition().setValue('some value');

        Rule.add()
          .setCondition('user.AgentVersion', '1.1.1')
          .setCondition('user.FavoriteFruit', 'Banana')
          .setCondition('user.BirthDate', '3d')
          .setCondition('user.IsInGroup', 'false')
          .setCondition('user.NumberOfSiblings', '1')
          .setCondition('unknown.identity', 'value');

        expect(Rule.count()).to.equal(2);
        expect(Key.goToSourceTab().source).to.deep.equal(expectedKeySource);

        Key.commitChanges();

        authoringApi.eventuallyExpectKey(keyName, ({ implementation }) =>
          expect(JSON.parse(implementation)).to.deep.equal(expectedKeySource),
        );
      });
    });

    describe('text editor', () => {
      it('should succeed editing JPad source', () => {
        Key.open('behavior_tests/edit_key/text/edit_test').goToSourceTab();

        Key.goToSourceTab().source = JSON.stringify(expectedKeySource, null, 4);

        Key.goToRulesTab();
        Alert.cancel();

        Key.insertSource().goToRulesTab();

        Rule.select().waitForVisible();

        expect(Key.goToSourceTab().source).to.deep.equal(expectedKeySource);

        Key.goToSourceTab().source = '{}';

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
      Key.open(keyName);
      const originalSource = Key.source;
      Key.source = JSON.stringify({ ...originalSource, boolProp: false });
      Key.commitChanges();
      tweekApiClient.waitForKeyToEqual(keyName, { boolProp: false });
    });
  });
});

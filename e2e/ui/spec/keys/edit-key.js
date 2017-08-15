/* global describe, before, after, it, browser */

import { expect } from 'chai';
import Key from '../../utils/Key';
import Rule from '../../utils/Rule';
import Alert from '../../utils/Alert';
import { dataComp } from '../../utils/selector-utils';
import tweekApiClient from '../../utils/tweekApiClient';

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
        Key.open('behavior_tests/edit_key/visual/edit_test').withDefaultValue('some default value');

        Rule.add().removeCondition().setValue('some value');

        Rule.add()
          .withCondition('user.AgentVersion', '1.1.1')
          .withCondition('user.FavoriteFruit', 'Banana')
          .withCondition('user.BirthDate', '3d')
          .withCondition('user.IsInGroup', 'false')
          .withCondition('user.NumberOfSiblings', '1');

        expect(Rule.count()).to.equal(2);
        expect(Key.source).to.deep.equal(expectedKeySource);

        Key.commitChanges();

        browser.refresh();
        expect(Key.source).to.deep.equal(expectedKeySource);
      });
    });

    describe('text editor', () => {
      it('should succeed editing JPad source', () => {
        Key.open('behavior_tests/edit_key/text/edit_test').sourceTab();

        Key.source = JSON.stringify(expectedKeySource, null, 4);

        Key.rulesTab();
        Alert.cancel();

        browser.click(dataComp('save-jpad-text'));
        Key.rulesTab();

        Rule.select().waitForVisible();
        expect(Key.source).to.deep.equal(expectedKeySource);

        Key.sourceTab().source = '{}';

        Key.rulesTab();
        Alert.ok();

        Rule.select().waitForVisible();
        expect(Key.source).to.deep.equal(expectedKeySource);
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
      browser.click(`${constEditor} .jsonValue input[type=checkbox]`);
      Key.commitChanges();
      tweekApiClient.waitForKeyToEqual(keyName, { boolProp: false });
    });
  });
});

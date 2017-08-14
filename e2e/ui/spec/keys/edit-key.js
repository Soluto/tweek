/* global describe, before, after, it, browser */

import * as KeysAsserts from '../../utils/key-asserts';
import { goToKey, commitChanges, setKeySource, sourceTab, rulesTab } from '../../utils/key-utils';
import Rule from '../../utils/Rule';
import { dataComp, alertButton } from '../../utils/selector-utils';
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
        goToKey('behavior_tests/edit_key/visual/edit_test');

        browser.setValue(dataComp('default-value'), 'some default value');

        Rule.add().removeCondition().setValue('some value');

        Rule.add()
          .withCondition('user.AgentVersion', '1.1.1')
          .withCondition('user.FavoriteFruit', 'Banana')
          .withCondition('user.BirthDate', '3d')
          .withCondition('user.IsInGroup', 'false')
          .withCondition('user.NumberOfSiblings', '1');

        KeysAsserts.assertKeyHasNumberOfRules(2);
        KeysAsserts.assertKeySource(expectedKeySource);

        commitChanges();

        browser.refresh();
        KeysAsserts.assertKeySource(expectedKeySource);
      });
    });

    describe('text editor', () => {
      it('should succeed editing JPad source', () => {
        goToKey('behavior_tests/edit_key/text/edit_test');

        browser.click(sourceTab);
        setKeySource(JSON.stringify(expectedKeySource, null, 4));

        browser.click(rulesTab);
        browser.clickWhenVisible(alertButton('cancel'), 5000);

        browser.click(dataComp('save-jpad-text'));
        browser.click(rulesTab);

        Rule.select().waitForVisible();
        KeysAsserts.assertKeySource(expectedKeySource);

        browser.click(sourceTab);
        setKeySource('{}');

        browser.click(rulesTab);
        browser.clickWhenVisible(alertButton('ok'), 5000);

        Rule.select().waitForVisible();
        KeysAsserts.assertKeySource(expectedKeySource);
      });
    });
  });

  describe('edit const keys', () => {
    const constKeyFolder = 'behavior_tests/edit_key/visual/const';
    const constEditor = dataComp('const-editor');

    it('should succeed editing key (valueType=number)', () => {
      const keyName = `${constKeyFolder}/number_type`;
      goToKey(keyName);
      browser.setValue(`${constEditor} input`, '30');
      commitChanges();
      tweekApiClient.waitForKeyToEqual(keyName, 30);
    });

    it('should succeed editing key (valueType=string)', () => {
      const keyName = `${constKeyFolder}/string_type`;
      goToKey(keyName);
      browser.setValue(`${constEditor} input`, 'world');
      commitChanges();
      tweekApiClient.waitForKeyToEqual(keyName, 'world');
    });

    it('should succeed editing key (valueType=object)', () => {
      const keyName = `${constKeyFolder}/object_type`;
      goToKey(keyName);
      browser.click(`${constEditor} .jsonValue input[type=checkbox]`);
      commitChanges();
      tweekApiClient.waitForKeyToEqual(keyName, { boolProp: false });
    });
  });
});

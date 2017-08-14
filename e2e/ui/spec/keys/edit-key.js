/* global describe, before, after, it, browser */

import * as KeysAsserts from '../../utils/key-asserts';
import * as KeyUtils from '../../utils/key-utils';
import Rule from '../../utils/Rule';
import selectors from '../../selectors/keySelectors';
import tweekApiClient from '../../utils/tweekApiClient';

describe('edit keys', () => {
  function goToKey(keyName) {
    KeyUtils.goToKey(keyName);
    browser.windowHandleMaximize();
    KeysAsserts.assertKeyOpened(keyName);
  }

  describe('edit JPad keys', () => {
    const testFolder = '@behavior_tests';
    const editKeyTestFolder = '@edit_key';

    describe('visual editor', () => {
      const keyToEdit = KeyUtils.generateTestKeyName('edit_key_test');
      const keyToEditFullPath = `${testFolder}/${editKeyTestFolder}/${keyToEdit}`;

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

      before(() => {
        KeyUtils.addEmptyKey(keyToEditFullPath);
      });

      it('should succeed editing JPad key', () => {
        goToKey(keyToEditFullPath);

        browser.setValue(selectors.DEFAULT_VALUE_INPUT, 'some default value');

        Rule.add().removeCondition().setValue('some value');

        Rule.add()
          .withCondition('user.AgentVersion', '1.1.1')
          .withCondition('user.FavoriteFruit', 'Banana')
          .withCondition('user.BirthDate', '3d')
          .withCondition('user.IsInGroup', 'false')
          .withCondition('user.NumberOfSiblings', '1');

        KeysAsserts.assertKeyHasNumberOfRules(2);

        KeysAsserts.assertKeySource(expectedKeySource);

        KeyUtils.commitChanges();

        browser.refresh();

        KeysAsserts.assertKeySource(expectedKeySource);
      });
    });

    describe('text editor', () => {
      before(() => {
        const keyToEdit = KeyUtils.generateTestKeyName('edit_key_source_test');
        const keyToEditFullPath = `${testFolder}/${editKeyTestFolder}/${keyToEdit}`;
        KeyUtils.addEmptyKey(keyToEditFullPath);
      });

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

      it('should succeed editing JPad source', () => {
        //go to source tab
        browser.click(selectors.SOURCE_TAB_ITEM);

        //set text
        KeyUtils.setKeySource(JSON.stringify(expectedKeySource, null, 4));

        //try to change tab - rodal should appear
        browser.click(selectors.RULES_TAB_ITEM);

        //cancel rodal
        browser.waitForVisible(selectors.ALERT_CANCEL_BUTTON, 5000);
        browser.click(selectors.ALERT_CANCEL_BUTTON);

        //save
        browser.click('.save-code-changes-button');

        //go to visual tab
        browser.click(selectors.RULES_TAB_ITEM);
        browser.waitForVisible(selectors.ADD_RULE_BUTTON, 5000);

        //assert key
        KeysAsserts.assertKeySource(expectedKeySource);

        //go to source tab
        browser.click(selectors.SOURCE_TAB_ITEM);

        //set other text
        KeyUtils.setKeySource('{}');

        //try to change tab - rodal should appear
        browser.click(selectors.RULES_TAB_ITEM);

        //accept rodal
        browser.waitForVisible(selectors.ALERT_OK_BUTTON, 5000);
        browser.click(selectors.ALERT_OK_BUTTON);
        browser.waitForVisible(selectors.ADD_RULE_BUTTON, 5000);

        //assert key
        KeysAsserts.assertKeySource(expectedKeySource);
      });
    });
  });

  describe('edit const keys', () => {
    const consts_path = '@behavior_tests/@const_keys';
    const const_selector = '*[data-comp=ConstEditor]';

    it('should succeed editing key (valueType=number)', () => {
      const key = `${consts_path}/number_type`;
      goToKey(key);
      browser.setValue(`${const_selector} input`, '30');
      KeyUtils.commitChanges();
      tweekApiClient.waitForKeyToEqual(key, 30);
    });

    it('should succeed editing key (valueType=string)', () => {
      const key = `${consts_path}/string_type`;
      goToKey(key);
      browser.setValue(`${const_selector} input`, 'world');
      KeyUtils.commitChanges();
      tweekApiClient.waitForKeyToEqual(key, 'world');
    });

    it('should succeed editing key (valueType=object)', () => {
      const key = `${consts_path}/object_type`;
      const currentValue = tweekApiClient.get(key);
      goToKey(key);
      browser.click(`${const_selector} .jsonValue input[type=checkbox]`);
      KeyUtils.commitChanges();
      tweekApiClient.waitForKeyToEqual(key, { boolProp: !currentValue.boolProp });
    });
  });
});

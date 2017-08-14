/* global describe, before, after, it, browser */

import KeysAsserts from '../../KeysAsserts';
import KeysPage from '../../utils/KeysPage';
import assert from 'assert';
import selectors from '../../selectors/keySelectors';
import tweekApiClient from '../../utils/tweekApiClient';

describe('edit keys', () => {
    function goToKey(keyName){
        KeysPage.goToKey(keyName);
        browser.windowHandleMaximize();
        KeysAsserts.assertKeyOpened(keyName);
    }

    describe('edit JPad keys', () => {
      const testFolder = KeysPage.TEST_KEYS_FOLDER;
      const editKeyTestFolder = '@edit_key';

      describe('visual editor', () => {
        const keyToEdit = KeysPage.generateTestKeyName('edit_key_test');
        const keyToEditFullPath = `${testFolder}/${editKeyTestFolder}/${keyToEdit}`;

        const expectedKeySource = {
          partitions: [],
          valueType: "string",
          rules: [{
            "Id": "985627a1-d627-5516-89a9-79bc1b5515d0",
            "Matcher": {
              "user.AgentVersion": "1.1.1",
              "user.FavoriteFruit": "Banana",
              "user.BirthDate": {
                "$withinTime": "3d"
              },
              "user.IsInGroup": false,
              "user.NumberOfSiblings": 1,
            },
            "Value": "",
            "Type": "SingleVariant"
          },
            {
              "Id": "b74a6ea7-3ad6-58bd-9159-8460162b2e42",
              "Matcher": {},
              "Value": "some value",
              "Type": "SingleVariant"
            }],
          defaultValue: 'some default value'
        };

        before(() => {
          KeysPage.goToBase();
          KeysPage.addEmptyKey(keyToEditFullPath);
        });

        function addRuleAndAssertItsFocus(numberOfRules) {

          for (let i = 0; i < numberOfRules; i++) {
            let ruleFirstConditionPropertyName = selectors.conditionPropertyName(i, 1);
            browser.click(selectors.ADD_RULE_BUTTON);
            assert(browser.hasFocus(ruleFirstConditionPropertyName), 'should focus the added rule first condition property name');
          }
        }

        it('should succeed editing JPad key', () => {
          goToKey(keyToEditFullPath);

          addRuleAndAssertItsFocus(2);
          KeysAsserts.assertKeyHasNumberOfRules(2);

          KeysPage.setConditionProperty(1, 1, 'AgentVersion');
          KeysPage.setConditionValue(1, 1, '1.1.1');

          KeysPage.addRuleCondition(1);
          KeysPage.setConditionProperty(1, 2, 'FavoriteFruit');
          KeysPage.setConditionValue(1, 2, 'Banana');

          KeysPage.addRuleCondition(1);
          KeysPage.setConditionProperty(1, 3, 'BirthDate');
          KeysPage.setConditionValue(1, 3, '3d');

          KeysPage.addRuleCondition(1);
          KeysPage.setConditionProperty(1, 4, 'IsInGroup');
          KeysPage.setConditionValue(1, 4, 'false');

          KeysPage.addRuleCondition(1);
          KeysPage.setConditionProperty(1, 5, 'NumberOfSiblings');
          KeysPage.setConditionValue(1, 5, '1');

          KeysPage.removeRuleCondition(2, 0);
          KeysPage.setRuleValue(2, 'some value');

          browser.setValue(selectors.DEFAULT_VALUE_INPUT, 'some default value');

          KeysAsserts.assertKeySource(expectedKeySource);

          KeysPage.commitChanges();

          browser.refresh();
          KeysPage.waitForPageToLoad(keyToEditFullPath);

          KeysAsserts.assertKeySource(expectedKeySource);
        });
      });

      describe('text editor', () => {
        before(() => {
          KeysPage.goToBase();

          const keyToEdit = KeysPage.generateTestKeyName('edit_key_source_test');
          const keyToEditFullPath = `${testFolder}/${editKeyTestFolder}/${keyToEdit}`;
          KeysPage.addEmptyKey(keyToEditFullPath);
        });

        const expectedKeySource = {
          partitions: [],
          valueType: "string",
          rules: [{
            "Id": "985627a1-d627-5516-89a9-79bc1b5515d0",
            "Matcher": {
              "user.AgentVersion": "1.1.1",
              "user.FavoriteFruit": "Banana",
              "user.BirthDate": {
                "$withinTime": "3d"
              }
            },
            "Value": "",
            "Type": "SingleVariant"
          },
            {
              "Id": "b74a6ea7-3ad6-58bd-9159-8460162b2e42",
              "Matcher": {},
              "Value": "some value",
              "Type": "SingleVariant"
            }],
          defaultValue: 'some default value'
        };

        it('should succeed editing JPad source', () => {
          //go to source tab
          browser.click(selectors.SOURCE_TAB_ITEM);

          //set text
          KeysPage.setKeySource(JSON.stringify(expectedKeySource, null, 4));

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
          KeysPage.setKeySource("{}");

          //try to change tab - rodal should appear
          browser.click(selectors.RULES_TAB_ITEM);

          //accept rodal
          browser.waitForVisible(selectors.ALERT_OK_BUTTON, 5000);
          browser.click(selectors.ALERT_OK_BUTTON);
          browser.waitForVisible(selectors.ADD_RULE_BUTTON, 5000);

          //assert key
          KeysAsserts.assertKeySource(expectedKeySource);
        })
      });
    });

    describe('edit const keys', () => {
        const consts_path= "@behavior_tests/@const_keys";
        const const_selector = "*[data-comp=ConstEditor]";
        
        it('should succeed editing key (valueType=number)', () => {
            const key = `${consts_path}/number_type`;
            goToKey(key);
            browser.setValue(`${const_selector} input`, '30');
          KeysPage.commitChanges();
            tweekApiClient.waitForKeyToEqual(key, 30);
        });

        it('should succeed editing key (valueType=string)', () => {
            const key = `${consts_path}/string_type`;
            goToKey(key);
            browser.setValue(`${const_selector} input`, 'world');
          KeysPage.commitChanges();
            tweekApiClient.waitForKeyToEqual(key, 'world');
        });

        it('should succeed editing key (valueType=object)', () => {
            const key = `${consts_path}/object_type`;
            const currentValue = tweekApiClient.get(key);
            goToKey(key);
            browser.click(`${const_selector} .jsonValue input[type=checkbox]`);
          KeysPage.commitChanges();
            tweekApiClient.waitForKeyToEqual(key, {boolProp: !currentValue.boolProp});
        });
      });
    });

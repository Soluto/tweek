/* global describe, before, after, it, browser */

import ContextPage from '../../utils/ContextPage';
import contextSelectors from '../../selectors/contextSelectors';
import assert from 'assert';
import Chance from 'chance';

const chance = new Chance();

describe('override keys', () => {
  const contextId = chance.guid();
  const contextType = 'user';
  const typedKey = '@behavior_tests/@context/override_key';

  before(() => {
    ContextPage.goToBase();
  });

  it('should modify override keys', () => {
    ContextPage.openContext(contextType, contextId);

    const fixedKeys = {
      'some/key': 'someValue',
      [typedKey]: 5,
    };

    for (const key in fixedKeys) {
      browser.click(contextSelectors.ADD_KEY_BUTTON);
      ContextPage.addOverrideKey(key, fixedKeys[key]);
    }

    ContextPage.saveChanges();

    let currentContext = ContextPage.getOverrideKeys(contextType, contextId);
    assert.deepEqual(currentContext, fixedKeys);

    const updatedKeys = {
      'some/key': 'newValue',
      'some/new/key': 'anotherValue',
    };

    browser.click(contextSelectors.keyDeleteButton(typedKey));
    const inputSelector = contextSelectors.keyValueInput('some/key');
    browser.waitForEnabled(inputSelector, 5000);
    browser.setValue(inputSelector, 'newValue');
    browser.click(contextSelectors.ADD_KEY_BUTTON);
    ContextPage.addOverrideKey('some/new/key', 'anotherValue');

    ContextPage.saveChanges();

    currentContext = ContextPage.getOverrideKeys(contextType, contextId);
    assert.deepEqual(currentContext, updatedKeys);

    const elements = browser.elements('[data-comp= fixed-keys] [data-comp= delete-key-button]').value;
    elements.forEach(element => element.click());

    ContextPage.saveChanges();

    currentContext = ContextPage.getOverrideKeys(contextType, contextId);
    assert.deepEqual(currentContext, {});
  });
});

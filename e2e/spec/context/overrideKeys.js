/* global describe, before, after, it, browser */

import ContextPageObject from '../../utils/ContextPageObject';
import contextSelectors from '../../selectors/contextSelectors';
import assert from 'assert';
import { expect } from 'chai';
import { diff } from 'deep-diff';
import Chance from 'chance';

const chance = new Chance();

describe('override keys', () => {
  const contextPageObject = new ContextPageObject(browser);
  const contextId = chance.guid();
  const contextType = 'user';

  before(() => {
    contextPageObject.goToBase();
  });

  it('should modify override keys', () => {
    contextPageObject.openContext(contextType, contextId);
    assert(contextPageObject.isInContextPage(contextType, contextId), 'should be in context page');

    const fixedKeys = {
      'some/key': 'someValue',
      'some/otherKey': 'someOtherValue',
    };

    Object.keys(fixedKeys).forEach((key, index) => {
      browser.setValue(contextSelectors.keyNameInput(index + 1), key);
      browser.setValue(contextSelectors.keyValueInput(index + 1), fixedKeys[key]);
      browser.click(contextSelectors.ADD_KEY_BUTTON);
    });

    contextPageObject.saveChanges();

    contextPageObject.goToContextUrl(contextType, contextId);

    let diffs = diff(contextPageObject.getContextData(), fixedKeys);
    expect(diffs).to.equal(undefined, 'contextData is not as expected. diffs are:' + JSON.stringify(diffs));

    const updatedKeys = {
      'some/otherKey': 'newValue',
      'some/new/key': 'anotherValue',
    };

    browser.click(contextSelectors.keyDeleteButton(1));
    browser.setValue(contextSelectors.keyValueInput(2), 'newValue');
    browser.click(contextSelectors.ADD_KEY_BUTTON);
    browser.setValue(contextSelectors.keyNameInput(3), 'some/new/key');
    browser.setValue(contextSelectors.keyValueInput(3), 'anotherValue');

    contextPageObject.saveChanges();

    contextPageObject.goToContextUrl(contextType, contextId);

    diffs = diff(contextPageObject.getContextData(), updatedKeys);
    expect(diffs).to.equal(undefined, 'contextData is not as expected. diffs are:' + JSON.stringify(diffs));
  });
});

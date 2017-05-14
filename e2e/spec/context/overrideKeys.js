/* global describe, before, after, it, browser */

import ContextPageObject from '../../utils/ContextPageObject';
import contextSelectors from '../../selectors/contextSelectors';
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

    const fixedKeys = {
      'some/key': 'someValue',
      'some/otherKey': 'someOtherValue',
    };

    Object.keys(fixedKeys).forEach((key) => {
      browser.setValue(contextSelectors.keyNameInput(), key);
      browser.setValue(contextSelectors.keyValueInput(key), fixedKeys[key]);
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

    browser.click(contextSelectors.keyDeleteButton('some/key'));
    browser.setValue(contextSelectors.keyValueInput('some/otherKey'), 'newValue');
    browser.click(contextSelectors.ADD_KEY_BUTTON);
    browser.setValue(contextSelectors.keyNameInput(), 'some/new/key');
    browser.setValue(contextSelectors.keyValueInput('some/new/key'), 'anotherValue');

    contextPageObject.saveChanges();

    contextPageObject.goToContextUrl(contextType, contextId);

    diffs = diff(contextPageObject.getContextData(), updatedKeys);
    expect(diffs).to.equal(undefined, 'contextData is not as expected. diffs are:' + JSON.stringify(diffs));
  });
});

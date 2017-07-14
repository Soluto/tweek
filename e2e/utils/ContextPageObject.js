import PageObject from './PageObject';
import globalSelectors from '../selectors/globalSelectors';
import contextSelectors from '../selectors/contextSelectors';
import tweekApiClient from './tweekApiClient';
import R from 'ramda';

export default class ContextPageObject extends PageObject {

  static CONTEXT_PAGE_URL = '/context';

  goToBase() {
    browser.url(ContextPageObject.CONTEXT_PAGE_URL)
    browser.waitForVisible(contextSelectors.CONTEXT_TYPE_INPUT, 5000);
  }

  waitForContext(contextType, contextId) {
    browser.waitForVisible(contextSelectors.ADD_KEY_BUTTON, 5000);
    browser.waitForVisible(contextSelectors.CURRENT_CONTEXT_TYPE, 5000);
    browser.waitUntil(() => {
        return this.browser.getText(contextSelectors.CURRENT_CONTEXT_TYPE).toLowerCase() === contextType.toLowerCase() &&
          this.browser.getText(contextSelectors.CURRENT_CONTEXT_ID).toLowerCase() === contextId.toLowerCase();
      }, 5000);
  }

  openContext(contextType, contextId) {
    browser.setValue(contextSelectors.CONTEXT_TYPE_INPUT, contextType);
    browser.setValue(contextSelectors.CONTEXT_ID_INPUT, contextId);
    browser.click(contextSelectors.OPEN_CONTEXT_BUTTON);

    this.waitForContext(contextType, contextId);
  }

  getOverrideKeys(contextType, contextId) {
    const FIXED_KEY_PREFIX = '@fixed:';

    const response = tweekApiClient.getContext(contextType, contextId);
    const fixedKeys = R.pickBy((_, prop) => prop.startsWith(FIXED_KEY_PREFIX), response);

    return Object.keys(fixedKeys).reduce((result, key) => ({...result, [key.substring(FIXED_KEY_PREFIX.length)]: fixedKeys[key]}), {});
  }

  isSaving() {
    return browser.getAttribute(contextSelectors.SAVE_CHANGES_BUTTON, 'data-state-is-saving') === 'true';
  }

  hasChanges() {
    return browser.getAttribute(contextSelectors.SAVE_CHANGES_BUTTON, 'data-state-has-changes') === 'true';
  }

  saveChanges() {
    browser.click(contextSelectors.SAVE_CHANGES_BUTTON)
    browser.waitUntil(() => !this.hasChanges() && !this.isSaving(), PageObject.GIT_TRANSACTION_TIMEOUT, "changes were not saved");
  }

  addOverrideKey(key, value, valueType = typeof value) {
    const valueInputSelector = contextSelectors.keyValueInput(key);
    browser.setValue(contextSelectors.keyNameInput(), key);
    browser.waitForEnabled(`${valueInputSelector}[data-comp= typed-input][data-value-type= "${valueType.toLowerCase()}"]`, 5000);
    browser.setValue(valueInputSelector, value);
  }
}

import contextSelectors from '../selectors/contextSelectors';
import tweekApiClient from './tweekApiClient';
import R from 'ramda';

export default class ContextPage {
  static TEST_KEYS_FOLDER = '@behavior_tests';
  static CONTEXT_PAGE_URL = '/context';

  static goToBase() {
    browser.url(ContextPage.CONTEXT_PAGE_URL);
    browser.waitForVisible(contextSelectors.CONTEXT_TYPE_INPUT, 5000);
  }

  static waitForContext(contextType, contextId) {
    browser.waitForVisible(contextSelectors.ADD_KEY_BUTTON, 5000);
    browser.waitForVisible(contextSelectors.CURRENT_CONTEXT_TYPE, 5000);
    browser.waitUntil(() => {
      return browser.getText(contextSelectors.CURRENT_CONTEXT_TYPE).toLowerCase() === contextType.toLowerCase() &&
        browser.getText(contextSelectors.CURRENT_CONTEXT_ID).toLowerCase() === contextId.toLowerCase();
    }, 5000);
  }

  static openContext(contextType, contextId) {
    browser.setValue(contextSelectors.CONTEXT_TYPE_INPUT, contextType);
    browser.setValue(contextSelectors.CONTEXT_ID_INPUT, contextId);
    browser.click(contextSelectors.OPEN_CONTEXT_BUTTON);

    ContextPage.waitForContext(contextType, contextId);
  }

  static getOverrideKeys(contextType, contextId) {
    const FIXED_KEY_PREFIX = '@fixed:';

    const response = tweekApiClient.getContext(contextType, contextId);
    const fixedKeys = R.pickBy((_, prop) => prop.startsWith(FIXED_KEY_PREFIX), response);

    return Object.keys(fixedKeys).reduce((result, key) => ({
      ...result,
      [key.substring(FIXED_KEY_PREFIX.length)]: fixedKeys[key],
    }), {});
  }

  static isSaving() {
    return browser.getAttribute(contextSelectors.SAVE_CHANGES_BUTTON, 'data-state-is-saving') === 'true';
  }

  static hasChanges() {
    return browser.getAttribute(contextSelectors.SAVE_CHANGES_BUTTON, 'data-state-has-changes') === 'true';
  }

  static saveChanges() {
    browser.click(contextSelectors.SAVE_CHANGES_BUTTON);
    browser.waitUntil(() => !ContextPage.hasChanges() && !ContextPage.isSaving(), 5000, 'changes were not saved');
  }

  static addOverrideKey(key, value, valueType = typeof value) {
    const newKey = dataComp => `[data-comp= new-fixed-key] [data-comp= ${dataComp}]`;
    browser.setValue(newKey('fixed-key-input'), key);
    browser.waitForEnabled(`${newKey('fixed-value-input')}[data-value-type= "${valueType.toLowerCase()}"]`, 5000);
    browser.setValue(newKey('fixed-value-input'), value);
    browser.click(contextSelectors.ADD_KEY_BUTTON);
  }
}

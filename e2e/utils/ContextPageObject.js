import PageObject from './PageObject';
import globalSelectors from '../selectors/globalSelectors';
import contextSelectors from '../selectors/contextSelectors';
import tweekApiClient from './tweekApiClient';
import R from 'ramda';

export default class ContextPageObject extends PageObject {

  static CONTEXT_PAGE_URL = 'context';

  goToBase() {
    return this.browser.url(PageObject.BASE_URL + ContextPageObject.CONTEXT_PAGE_URL)
      .waitForVisible(contextSelectors.CONTEXT_TYPE_INPUT, 5000);
  }

  waitForContext(contextType, contextId) {
    return this.browser.waitForVisible(contextSelectors.ADD_KEY_BUTTON, 5000)
      .waitForVisible(contextSelectors.CURRENT_CONTEXT_TYPE, 5000)
      .waitUntil(() => {
        return this.browser.getText(contextSelectors.CURRENT_CONTEXT_TYPE).toLowerCase() == contextType.toLowerCase() &&
          this.browser.getText(contextSelectors.CURRENT_CONTEXT_ID).toLowerCase() == contextId.toLowerCase();
      }, 5000);
  }

  async openContext(contextType, contextId) {
    await this.browser.setValue(contextSelectors.CONTEXT_TYPE_INPUT, contextType)
      .setValue(contextSelectors.CONTEXT_ID_INPUT, contextId)
      .click(contextSelectors.OPEN_CONTEXT_BUTTON);

    await this.waitForContext(contextType, contextId);
  }

  async getOverrideKeys(contextType, contextId) {
    const FIXED_KEY_PREFIX = '@fixed:';

    const tweekApi = await tweekApiClient;
    const response = await tweekApi.get(`/api/v1/context/${contextType}/${contextId}`);
    const fixedKeys = R.pickBy((_, prop) => prop.startsWith(FIXED_KEY_PREFIX), response.data);

    return Object.keys(fixedKeys).reduce((result, key) => ({...result, [key.substring(FIXED_KEY_PREFIX.length)]: fixedKeys[key]}), {});
  }

  isSaving() {
    return this.browser.getAttribute(contextSelectors.SAVE_CHANGES_BUTTON, 'data-state-is-saving') === 'true';
  }

  hasChanges() {
    return this.browser.getAttribute(contextSelectors.SAVE_CHANGES_BUTTON, 'data-state-has-changes') === 'true';
  }

  saveChanges() {
    return this.browser.click(contextSelectors.SAVE_CHANGES_BUTTON)
      .waitUntil(() => !this.hasChanges() && !this.isSaving(), PageObject.GIT_TRANSACTION_TIMEOUT, "changes were not saved");
  }

  addOverrideKey(key, value) {
    const valueInputSelector = contextSelectors.keyValueInput(key);
    return this.browser.setValue(contextSelectors.keyNameInput(), key)
      .waitForEnabled(valueInputSelector, 5000)
      .setValue(valueInputSelector, value);
  }
}

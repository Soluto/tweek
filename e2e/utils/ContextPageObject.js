import PageObject from './PageObject';
import globalSelectors from '../selectors/globalSelectors';
import contextSelectors from '../selectors/contextSelectors';

export default class ContextPageObject extends PageObject {

  static CONTEXT_PAGE_URL = 'context';

  goToBase() {
    this.browser.url(PageObject.BASE_URL + ContextPageObject.CONTEXT_PAGE_URL);
    this.browser.acceptAlertIfPresent();

    this.browser.waitForVisible(contextSelectors.CONTEXT_TYPE_INPUT, 5000);
  }

  waitForContext(contextType, contextId) {
    this.browser.waitForVisible(contextSelectors.ADD_KEY_BUTTON, 5000);
    this.browser.waitForVisible(contextSelectors.CURRENT_CONTEXT_TYPE, 5000);

    this.browser.waitUntil(() => {
      return this.browser.getText(contextSelectors.CURRENT_CONTEXT_TYPE).toLowerCase() == contextType.toLowerCase() &&
        this.browser.getText(contextSelectors.CURRENT_CONTEXT_ID).toLowerCase() == contextId.toLowerCase();
    }, 5000);
  }

  goToContextUrl(contextType, contextId) {
    const goTo = `${PageObject.BASE_URL}${ContextPageObject.CONTEXT_PAGE_URL}/${contextType}/${contextId}`;
    this.browser.url(goTo);
    this.browser.acceptAlertIfPresent();

    this.waitForContext(contextType, contextId);
  }

  openContext(contextType, contextId) {
    this.browser.setValue(contextSelectors.CONTEXT_TYPE_INPUT, contextType);
    const suggestionSelector = globalSelectors.typeaheadSuggestionByIndex(0);
    this.browser.click(suggestionSelector);
    this.browser.setValue(contextSelectors.CONTEXT_ID_INPUT, contextId);
    this.browser.click(contextSelectors.OPEN_CONTEXT_BUTTON);

    this.waitForContext(contextType, contextId);
  }

  getContextData() {
    const numOfKeys = this.getNumberOfKeys();

    const contextData = {};

    for (let i = 1; i <= numOfKeys; i++) {
      const key = this.browser.getValue(contextSelectors.keyNameInputByIndex(i));
      contextData[key] = this.browser.getValue(contextSelectors.keyValueInputByIndex(i));
    }

    return contextData;
  }

  getNumberOfKeys() {
    return this.browser.elements(contextSelectors.keyContainerByIndex()).value.length;
  }

  isSaving() {
    return this.browser.getAttribute(contextSelectors.SAVE_CHANGES_BUTTON, 'data-state-is-saving') === 'true';
  }

  hasChanges() {
    return this.browser.getAttribute(contextSelectors.SAVE_CHANGES_BUTTON, 'data-state-has-changes') === 'true';
  }

  saveChanges() {
    this.browser.click(contextSelectors.SAVE_CHANGES_BUTTON);
    this.browser.waitUntil(() => !this.hasChanges() && !this.isSaving(), PageObject.GIT_TRANSACTION_TIMEOUT, "changes were not saved");
  }
}

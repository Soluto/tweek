import nconf from 'nconf';

export default class PageObject {
  static BASE_URL = nconf.get('BACKOFFICE_URL');
  static TEST_KEYS_FOLDER = '@behavior_tests';
  static GIT_TRANSACTION_TIMEOUT = 60000;

  constructor(browser) {
    this.browser = browser;
  }

  getUrlLocation() {
    return this.browser.getUrl().split(PageObject.BASE_URL)[1];
  }

  wait(delayInMs, printWait = true) {
    if (printWait) console.log('wait', delayInMs, 'ms');
    this.browser.pause(delayInMs);
  }
}

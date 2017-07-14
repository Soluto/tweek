import nconf from 'nconf';

export default class PageObject {
  static TEST_KEYS_FOLDER = '@behavior_tests';
  static GIT_TRANSACTION_TIMEOUT = 60000;

  constructor(browser) {
    this.browser = browser;
  }

  wait(delayInMs, printWait = true) {
    if (printWait) console.log('wait', delayInMs, 'ms');
    this.browser.pause(delayInMs);
  }
}

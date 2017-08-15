import { alertButton } from './selector-utils';
const timeout = 1000;
const alertBackground = '.rodal-mask';

export default {
  ok() {
    browser.clickWhenVisible(alertButton('ok'), timeout);
  },
  cancel() {
    browser.clickWhenVisible(alertButton('cancel'), timeout);
  },
  background() {
    browser.waitForVisible(alertBackground, timeout);
    browser.leftClick(alertBackground, -200, -200);
  },
  acceptIfRaised() {
    browser.clickIfVisible(alertButton('ok'), timeout);
  },
};

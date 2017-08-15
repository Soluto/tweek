import { alertButton } from './selector-utils';
const timeout = 1000;
const alertBackground = '.rodal-mask';

function click(button) {
  browser.clickWhenVisible(alertButton(button), timeout);
}

export default {
  click,
  ok: () => click('ok'),
  cancel: () => click('cancel'),
  background() {
    browser.waitForVisible(alertBackground, timeout);
    browser.leftClick(alertBackground, -200, -200);
  },
  waitFor(button, reverse) {
    browser.waitForVisible(alertButton(button), timeout, reverse);
  },
  acceptIfRaised() {
    browser.clickIfVisible(alertButton('ok'), timeout);
  },
};

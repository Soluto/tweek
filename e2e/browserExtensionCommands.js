module.exports = function (browser) {
  browser.addCommand("runAsync", fn => fn());

  browser.addCommand('waitForAlert', function (timeout, timeoutMsg, interval) {
    return this.waitUntil(() => this.alertText(), timeout, timeoutMsg, interval);
  });

  browser.addCommand('acceptAlertIfPresent', function() {
    try {
      this.alertAccept();
    } catch(_) { }
  });

  browser.addCommand('clickIfVisible', function (selector, timeout) {
    try {
      this.waitForVisible(selector, timeout);
      this.pause(50);
      this.click(selector);
    } catch (_) { }
  });

  browser.addCommand('clickWhenVisible', function (selector, timeout) {
    this.waitForVisible(selector, timeout);
    this.click(selector);
  });

  browser.addCommand('waitForVisibleWithRefresh', function (selector, timeout, retries = 3) {
    let retiresLeft = retries;
    let exception;
    while (retiresLeft > 0) {
      try {
        this.waitForVisible(selector, timeout / retries);
        break;
      } catch (error) {
        retiresLeft--;
        exception = error;
      }
    }
    if(!retiresLeft) throw exception;
  });
};

module.exports = function (browser) {
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
  })
};
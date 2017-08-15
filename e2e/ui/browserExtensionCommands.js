module.exports = function(browser) {
  browser.addCommand('runAsync', fn => fn());

  browser.addCommand('waitForAlert', function(timeout, timeoutMsg, interval) {
    return this.waitUntil(() => this.alertText(), timeout, timeoutMsg, interval);
  });

  browser.addCommand('clickIfVisible', function(selector, timeout) {
    try {
      this.waitForVisible(selector, timeout);
      this.pause(50);
      this.click(selector);
    } catch (_) {}
  });

  browser.addCommand('clickWhenVisible', function(selector, timeout) {
    this.waitForVisible(selector, timeout);
    this.click(selector);
  });

  browser.addCommand('waitToPass', function(fn, timeout, interval) {
    let thrownException = undefined;
    try {
      return this.waitUntil(
        () => {
          try {
            fn();
            return true;
          } catch (ex) {
            thrownException = ex;
            return false;
          }
        },
        timeout,
        null,
        interval,
      );
    } catch (ex) {
      throw thrownException || ex;
    }
  });
};

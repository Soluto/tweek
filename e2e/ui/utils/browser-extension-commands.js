module.exports = function(browser) {
  browser.addCommand('runAsync', fn => fn());

  browser.addCommand('waitForAlert', function(timeout, timeoutMsg, interval) {
    return this.waitUntil(
      () => {
        this.alertText();
        // designed to solved no custom message (empty string) when refreshing: https://www.chromestatus.com/feature/5349061406228480
        // alertText should throw if there's no alert http://webdriver.io/api/protocol/alertText.html
        return true;
      },
      timeout,
      timeoutMsg,
      interval,
    );
  });

  browser.addCommand('clickIfVisible', function(selector, timeout, reverse) {
    try {
      this.waitForVisible(selector, timeout, reverse);
      this.pause(50);
      if (!reverse) {
        this.click(selector);
      }
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

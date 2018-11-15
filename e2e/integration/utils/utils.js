const delay = duration => new Promise(resolve => setTimeout(resolve, duration));

module.exports.pollUntil = async (action, assert, delayDuration = 0) => {
  while (true) {
    let result = await action();
    try {
      assert(result);
      break;
    } catch (ex) {}
    await delay(delayDuration);
  }
};

module.exports.waitUntil = async function(action, timeout = 15000, delayDuration = 25) {
  let shouldStop = false;
  const timeoutRef = setTimeout(() => (shouldStop = true), timeout);
  let error;
  while (!shouldStop) {
    try {
      await action();
      clearTimeout(timeoutRef);
      return;
    } catch (ex) {
      error = ex;
    }
    delayDuration && (await delay(delayDuration));
  }
  throw error;
};

module.exports.delay = delay;

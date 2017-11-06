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

module.exports.waitUntil = async function(action, timeout = 15000, delayDuration = 0) {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      await action();
      return;
    } catch (ex) {}
    await delay(delayDuration);
  }
  await action();
};

module.exports.delay = delay;

const delay = duration => new Promise(resolve => setTimeout(resolve, duration));

module.exports.pollUntil = async (action, assert, timeout = 10000, delayDuration = 0) => {
  const startTime = new Date();
  while (startTime + timeout > new Date()) {
    let result = await action();
    try {
      assert(result);
      return;
    } catch (ex) {}
    await delay(delayDuration);
  }
  let result = await action();
  assert(result);
};

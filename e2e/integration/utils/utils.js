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

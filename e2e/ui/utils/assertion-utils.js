export const waitFor = async (fn, timeout = 10000, delay = 100) => {
  const start = Date.now();
  while (true) {
    try {
      await fn();
      return;
    } catch (e) {
      if (Date.now() - start >= timeout) {
        throw e;
      }
      await new Promise((r) => setTimeout(r, delay));
    }
  }
};

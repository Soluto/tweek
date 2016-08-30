function createLock() {
  let lock;
  return {
    synchronized(fn) {
      return function () {
        const args = arguments;
        const context = this;

        lock = lock ? lock.then(
          () => {
            lock = context::fn(...args);
            return lock;
          }) : context::fn(...args);

        return lock.catch(
          (ex) => {
            lock = Promise.resolve();
            throw ex;
          });
      };
    },
  };
}

export default createLock;

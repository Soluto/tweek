function synchronizedFunction(fn) {
  let lock = Promise.resolve();

  return function () {
    const args = arguments;
    const context = this;

    return lock.then(
      () => {
        lock = fn.apply(context, args);
        return lock;
      }).catch(
      () => {
        lock = Promise.resolve();
      });
  };
}

export default synchronizedFunction;

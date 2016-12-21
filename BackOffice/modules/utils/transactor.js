
class Transactor {
  constructor(contextPromise){
    this._contextPromise = contextPromise;
    const lock = createLock();
    this.transact = lock.synchronized(this.transact);
  }

  async transact(transactionAction) {
    try {
      let context = await this._contextPromise;
      return await transactionAction(context);
    }
    catch (err) {
      console.error('Error occurred during transaction ', err);
      throw err;
    }
  }
}

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


export default Transactor;
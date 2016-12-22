
class Transactor {
  constructor(contextPromise, prepareAction, cleanupAction){
    this._contextPromise = contextPromise;
    this._prepareAction = prepareAction;
    this._cleanupAction = cleanupAction;
    const lock = createLock();
    this.transact = lock.synchronized(this.transact);
  }

  async transact(transactionAction) {
    let context = await this._contextPromise;

    try {
      if (this._prepareAction)
        await this._prepareAction(context);

      return await transactionAction(context);
    }
    catch (err) {
      console.error('Error occurred during transaction ', err);
      throw err;
    }
    finally {
      if (this._cleanupAction)
        this._cleanupAction(context);
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
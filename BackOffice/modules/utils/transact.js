import createLock from "./createLock";

class Transactionable {
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

export default Transactionable;
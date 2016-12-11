import createLock from "./createLock";

class Transactionable {
  constructor(contextPromise){
    this._contextPromise = contextPromise;
    const lock = createLock();
    this.transact = lock.synchronized(this.transact);
  }

  async transact(transactionAction) {
    let context = await this._contextPromise;
    return await transactionAction(context);
  }
}

export default Transactionable;
import Locker from 'lock-queue';

export default class Transactor {
  constructor(contextPromise, cleanupAction) {
    this._contextPromise = contextPromise;
    this._cleanupAction = cleanupAction;

    this._lock = new Locker();
  }

  async read(readAction) {
    let context = await this._contextPromise;

    return await this._lock.run(async () => {
      try {
        return await readAction(context);
      } catch (err) {
        console.error('Error occurred during transaction ', err);
        throw err;
      }
    });
  }

  async with(action) {
    let context = await this._contextPromise;
    return await action(context);
  }

  async write(transactionAction) {
    let context = await this._contextPromise;
    return await this._lock.lock(async () => {
      try {
        return await transactionAction(context);
      } catch (err) {
        console.error('Error occurred during transaction ', err);
        throw err;
      } finally {
        if (this._cleanupAction) await this._cleanupAction(context);
      }
    });
  }
}

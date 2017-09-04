import Locker = require('lock-queue');

export type AsyncFunc<T, U> = (context: T) => Promise<U>;

export default class Transactor<T> {
  _lock: Locker;
  constructor(private _contextPromise: Promise<T>, private _cleanupAction) {

    this._lock = new Locker();
  }

  async read<U>(readAction: AsyncFunc<T, U>): Promise<U> {
    const context = await this._contextPromise;
    return await this._lock.run(() => readAction(context));
  }

  async with<U>(action: AsyncFunc<T, U>): Promise<U> {
    const context = await this._contextPromise;
    return await action(context);
  }

  async write<U>(transactionAction: AsyncFunc<T, U>): Promise<U> {
    const context = await this._contextPromise;
    return await this._lock.lock(async () => {
      try {
        return await transactionAction(context);
      } finally {
        if (this._cleanupAction) await this._cleanupAction(context);
      }
    });
  }
}

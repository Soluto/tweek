import Locker from 'lock-queue';
import logger from './logger';

export type AsyncFunc<T, U> = (context: T) => Promise<U>;

export interface TransactionObject<T, U> {
  action: AsyncFunc<T, U>;
  rollback?: (context: T) => Promise<void>;
  shouldRetry?: (error: any, context: T) => Promise<boolean>;
}

export default class Transactor<T> {
  _lock: Locker;
  constructor(
    private _contextPromise: Promise<T>,
    private _rollbackAction: (context: T) => Promise<void> = async _ => {},
    private _shouldRetry: (error: any, context: T) => Promise<boolean> = async (_, __) => false,
  ) {
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

  async write<U>(transaction: AsyncFunc<T, U>): Promise<U> {
    const context = await this._contextPromise;
    const transactionObject = typeof transaction === 'function' ? { action: transaction } : transaction;

    return await this._lock.lock(async () => {
      for (;;) {
        try {
          return await transactionObject.action(context);
        } catch (err) {
          logger.warn({ err }, 'failed transaction, rolling back');
          await this._rollbackAction(context);
          if (!(await this._shouldRetry(err, context))) {
            throw err;
          }
          continue;
        }
      }
    });
  }
}

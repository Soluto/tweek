/* global describe, it, before, after, beforeEach, afterEach */
import * as Mocha from 'mocha';
const chai = require('chai');
import { expect, assert } from 'chai';
import Transactor from '../src/utils/transactor';

class Counter {
  constructor(public counter = 0) {}
  async increment() {
    return ++this.counter;
  }
  async decrement() {
    return --this.counter;
  }
  async reset() {
    this.counter = 0;
  }
}

describe('Transactor', () => {
  describe('r/w locks', () => {
    it(`'write' should to run in sequence`, async () => {
      const testObject = new Counter();
      const transactor = new Transactor(Promise.resolve(testObject), (counter) => counter.reset());
      transactor.write(async (counter) => counter.increment());
      transactor.write(async (counter) => Promise.resolve().then(() => counter.reset()));
      await transactor.write(async (counter) => counter.increment());
      expect(testObject.counter).to.equal(1);
    });

    it(`'read' should wait for write to finish`, async () => {
      const testObject = new Counter();
      const transactor = new Transactor(Promise.resolve(testObject), (counter) => counter.reset());
      transactor.write(async (counter) => counter.increment());
      transactor.write(async (counter) => Promise.resolve().then(() => counter.increment()));
      const value = await transactor.read(async (counter) => counter.counter);
      expect(value).to.equal(2);
    });

    it(`'with' should ignore r/w locks`, async () => {
      const testObject = new Counter();
      const transactor = new Transactor(Promise.resolve(testObject), (counter) => counter.reset());
      transactor.write(async (counter) => counter.increment());
      transactor.write(async (counter) => Promise.resolve().then(() => counter.increment()));
      const value = await transactor.with(async (counter) => counter.counter);
      expect(value).to.equal(1);
    });
  });

  describe('transaction', () => {
    it('should rollback a failed transaction', async () => {
      const testObject = new Counter();
      const transactor = new Transactor(Promise.resolve(testObject), (counter) => counter.reset());
      try {
        await transactor.write((counter) => {
          counter.increment();
          throw new Error('FAIL');
        });
        assert.fail();
      } catch (ex) {
        expect(ex.message).to.equal('FAIL');
        expect(testObject.counter).to.equal(0);
      }
    });

    it('should be able to retry sequence', async () => {
      let retryCount = 0;
      const testObject = new Counter();
      const transactor = new Transactor(
        Promise.resolve(testObject),
        (counter) => counter.reset(),
        async (c) => ++retryCount && true,
      );
      await transactor.write(async (counter) => {
        counter.increment();
        if (retryCount < 3) {
          throw new Error('FAIL');
        }
      });
      expect(retryCount).to.equal(3);
      expect(testObject.counter).to.equal(1);
    });

    it('retry return false, propgate error', async () => {
      let retryCount = 0;
      const testObject = new Counter();
      const transactor = new Transactor(
        Promise.resolve(testObject),
        (counter) => counter.reset(),
        async (c) => ++retryCount && retryCount < 3,
      );
      try {
        await transactor.write(async (counter) => {
          counter.increment();
          throw new Error('FAIL');
        });
        assert.fail();
      } catch (ex) {
        expect(ex.message).to.equal('FAIL');
        expect(testObject.counter).to.equal(0);
        expect(retryCount).to.equal(3);
      }
    });
  });
});

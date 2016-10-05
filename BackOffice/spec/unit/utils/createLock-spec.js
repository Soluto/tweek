/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../modules/utils/createLock');

import createLock from '../../../modules/utils/createLock';

describe('createLock', () => {
  it('should return object with syncronized funtion', async () => {
    // Arrange
    let someValue = 0;

    const promiseResolvers = [];

    const firstCallPromise = new Promise((resolve, reject) => {
      console.log('promise 1');
      promiseResolvers.push(resolve);
    });

    const secondCallPromise = new Promise((resolve, reject) => {
      console.log('promise 2');
      promiseResolvers.push(resolve);
    });

    const asyncFirstFunc = async () => {
      someValue++;
      await firstCallPromise;
    };

    const asyncSecondFunc = async () => {
      someValue++;
      await secondCallPromise;
    };

    const lock = createLock();

    const func1 = lock.synchronized(asyncFirstFunc);
    const func2 = lock.synchronized(asyncSecondFunc);

    // Act
    const fn1Promise = func1();
    func2();

    // Assert
    expect(someValue).toEqual(1);
    promiseResolvers[0]('');
    await fn1Promise;
    expect(someValue).toEqual(2);
    promiseResolvers[1]('');
  });
});

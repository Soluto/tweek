/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../../modules/pages/keys/ducks/selectedKey');
jest.unmock('../../../../../modules/pages/keys/ducks/blankKeyDefinition');

import { openKey } from '../../../../../modules/store/ducks/selectedKey';
import { createBlankKey, BLANK_KEY_NAME } from '../../../../../modules/store/ducks/blankKeyDefinition';
import { assert, expect } from 'chai';
import fetchMock from 'fetch-mock';

describe('selectedKey', async () => {

  let dispatchMock;

  beforeEach(() => {
    dispatchMock = jest.fn();
  });

  afterEach(() => {
    fetchMock.restore();
  });

  const KEY_OPENED = 'KEY_OPENED';
  const KEY_OPENING = 'KEY_OPENING';

  describe('openKey', () => {
    it('should dispatch KEY_OPENED with blank payload for blank key name', () => {
      // Act
      const func = openKey(BLANK_KEY_NAME);
      func(dispatchMock);

      // Assert
      assert(dispatchMock.mock.calls.length, 1, 'should call dispatch once');
      expect(dispatchMock.mock.calls[0][0]).to.deep.equal({ type: KEY_OPENED, payload: createBlankKey() });
    });

    it('should dispatch KEY_OPENING with correct payload', async () => {
      // Arrange
      const keyName = 'category//some key';

      // Act
      const func = openKey(keyName);
      await func(dispatchMock);

      // Assert
      assert(dispatchMock.mock.calls.length > 0, 'should call dispatch atleast once');

      const dispatchAction = dispatchMock.mock.calls[0][0];
      assert.strictEqual(dispatchAction.type, KEY_OPENING, 'should deliver correct dispatch type');
      expect(keyName).to.deep.equal(dispatchAction.payload);
    });

    it('should dispatch KEY_OPENED with correct payload if GET succeeded', async () => {
      // Arrange
      const keyName = 'category//some key';

      const expectedKeyData = {
        keyDef: 'some key definition',
        meta: 'some meta',
      };

      const expectedPayload = {
        key: keyName,
        meta: expectedKeyData.meta,
        keyDef: expectedKeyData.keyDef,
      };

      fetchMock.get('glob:*/api/keys/*', expectedKeyData);

      // Act
      const func = openKey(keyName);
      await func(dispatchMock);

      // Assert
      assert(dispatchMock.mock.calls.length === 2, 'should call dispatch once');

      const secondDispatchAction = dispatchMock.mock.calls[1][0];
      assert.strictEqual(secondDispatchAction.type, KEY_OPENED, 'should deliver correct dispatch type');
      expect(expectedPayload).to.deep.equal(secondDispatchAction.payload);
    });

    it('should dispatch KEY_OPENED with correct payload if GET failed', async () => {
      // Arrange
      const keyName = 'category//some key';

      const expectedPayload = {
        key: keyName,
        meta: null,
        keyDef: null,
      };

      fetchMock.get('glob:*/api/keys/*', { throws: 'some fetch exception' });

      // Act
      const func = openKey(keyName);
      await func(dispatchMock);

      // Assert
      assert(dispatchMock.mock.calls.length === 2, 'should call dispatch once');

      const secondDispatchAction = dispatchMock.mock.calls[1][0];
      assert.strictEqual(secondDispatchAction.type, KEY_OPENED, 'should deliver correct dispatch type');
      expect(expectedPayload).to.deep.equal(secondDispatchAction.payload);
    });
  });
});
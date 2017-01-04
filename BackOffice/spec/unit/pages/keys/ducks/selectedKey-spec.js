/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../../modules/store/ducks/selectedKey');
jest.unmock('../../../../../modules/store/ducks/ducks-utils/blankKeyDefinition');
jest.unmock('../../../../../modules/utils/http');

import { openKey, saveKey } from '../../../../../modules/store/ducks/selectedKey';
import { createBlankKey, BLANK_KEY_NAME } from '../../../../../modules/store/ducks/ducks-utils/blankKeyDefinition';
import { assert, expect } from 'chai';
import fetchMock from 'fetch-mock';

describe('selectedKey', async () => {

  const KEY_OPENED = 'KEY_OPENED';
  const KEY_OPENING = 'KEY_OPENING';
  const KEY_SAVED = 'KEY_SAVED';
  const KEY_SAVING = 'KEY_SAVING';
  const KEY_ADDED = 'KEY_ADDED';

  let dispatchMock;
  let currentState;

  beforeEach(() => {
    dispatchMock = jest.fn();
    currentState = {};
  });

  afterEach(() => {
    fetchMock.restore();
  });

  const generateState = (openedKeyName, keyNameToAdd) => {
    return {
      selectedKey: {
        key: openedKeyName,
        local: {
          key: keyNameToAdd,
          keyDef: 'some jpad',
        }
      }
    };
  };

  const doesDispatchPushTookAction = () => dispatchMock.mock.calls
    .map(x => x[0])
    .some(x => x.payload &&
      x.payload.method &&
      x.payload.method === 'push');

  const doesSpecificDispatchTookAction = (dispatchActionType) => dispatchMock.mock.calls
    .map(x => x[0])
    .some(x => x.type === dispatchActionType);

  describe('openKey', () => {
    it('should dispatch KEY_OPENED with blank payload for blank key name', () => {
      // Act
      const func = openKey(BLANK_KEY_NAME);
      func(dispatchMock);

      // Assert
      assert(dispatchMock.mock.calls.length, 1, 'should call dispatch once');

      const keyOpenedDispatchAction = dispatchMock.mock.calls[0][0];
      expect(keyOpenedDispatchAction).to.deep.equal({ type: KEY_OPENED, payload: createBlankKey() }, 'should dispatch correct action');
    });

    it('should dispatch KEY_OPENING with correct payload', async () => {
      // Arrange
      const keyName = 'category//some key';

      // Act
      const func = openKey(keyName);
      await func(dispatchMock);

      // Assert
      assert(dispatchMock.mock.calls.length > 0, 'should call dispatch atleast once');

      const keyOpeningdDispatchAction = dispatchMock.mock.calls[0][0];
      expect(keyOpeningdDispatchAction).to.deep.equal({ type: KEY_OPENING, payload: keyName }, 'should dispatch correct action');
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

      const keyOpenedDispatchAction = dispatchMock.mock.calls[1][0];
      expect(keyOpenedDispatchAction).to.deep.equal({ type: KEY_OPENED, payload: expectedPayload }, 'should dispatch correct action');
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

      const keyOpenedDispatchAction = dispatchMock.mock.calls[1][0];
      expect(keyOpenedDispatchAction).to.deep.equal({ type: KEY_OPENED, payload: expectedPayload }, 'should dispatch correct action');
    });
  });

  describe('saveKey', () => {
    const commonSaveKeyFollowTest = (isNewKey) => it('should dispatch KEY_SAVING, fetch PUT key and dispatch KEY_SAVED', async () => {
      // Arrange
      const keyNameToSave = 'someCategory/someKeyName';

      currentState = generateState(isNewKey ? BLANK_KEY_NAME : keyNameToSave, keyNameToSave);

      fetchMock.putOnce('glob:*/api/keys/*', {});

      // Act
      const func = saveKey();
      await func(dispatchMock, () => currentState);

      // Assert
      assert(fetchMock.done(), 'should call fetch once');

      const fetchJsonDataString = fetchMock.lastOptions().body;
      assert(JSON.parse(fetchJsonDataString), currentState.selectedKey.local, 'should pass correct data to fetch PUT');

      const [[keySavingDispatchAction], [keySavedDispatchAction]] = dispatchMock.mock.calls;
      expect(keySavingDispatchAction).to.deep.equal({ type: KEY_SAVING }, 'should dispatch correct action');
      expect(keySavedDispatchAction).to.deep.equal({ type: KEY_SAVED, payload: keyNameToSave }, 'should dispatch correct action');
    });

    describe('save new key', () => {
      commonSaveKeyFollowTest(true);

      it('should open the new saved key if there wasnt key change while saving', async () => {
        // Arrange
        const keyNameToSave = 'someCategory/someKeyName';

        currentState = generateState(BLANK_KEY_NAME, keyNameToSave);

        fetchMock.putOnce('glob:*/api/keys/*', {});

        // Act
        const func = saveKey();
        await func(dispatchMock, () => currentState);

        assert(dispatchMock.mock.calls.length === 4, 'should call dispatch 4 times');

        const [[_], [__], [keyAddedDispatchAction], [pushDispatchAction]] = dispatchMock.mock.calls;
        expect(keyAddedDispatchAction).to.deep.equal({ type: KEY_ADDED, payload: keyNameToSave }, 'should dispatch correct action');

        const expectedPushPayload = {
          method: 'push',
          args: [`/keys/${keyNameToSave}`],
        };

        expect(pushDispatchAction.payload).to.deep.equal(expectedPushPayload, 'should deliver correct push dispatch action payload');
      });

      it('should not open the new saved key if there was key change while saving', async () => {
        // Arrange
        const keyNameToSave = 'someCategory/someKeyName';

        currentState = generateState(BLANK_KEY_NAME, keyNameToSave);

        let fetchPutResolver;
        const fetchPromise = new Promise((resolve, _) => {
          fetchPutResolver = resolve;
        });

        fetchMock.putOnce('glob:*/api/keys/*', fetchPromise);

        // Act
        const func = saveKey();
        const saveKeyPromise = func(dispatchMock, () => currentState);

        currentState.selectedKey.key = 'some other key name';
        fetchPutResolver({});
        await saveKeyPromise;

        assert(!doesDispatchPushTookAction(), 'should not open the new saved key');
      });
    });

    describe('save existing key', () => {
      commonSaveKeyFollowTest(false);

      it('should not dispatch KEY_ADDED, and not open the saved key', async () => {
        // Arrange
        const keyNameToSave = 'someCategory/someKeyName';

        currentState = generateState(keyNameToSave);

        fetchMock.putOnce('glob:*/api/keys/*', {});

        // Act
        const func = saveKey();
        await func(dispatchMock, () => currentState);

        assert(!doesDispatchPushTookAction(), 'should not open the new saved key');
        assert(!doesSpecificDispatchTookAction(KEY_ADDED), 'should not dispatch KEY_ADDED');
      });
    });
  });
});
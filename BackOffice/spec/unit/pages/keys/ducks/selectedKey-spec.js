/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../../modules/store/ducks/tags');
jest.unmock('../../../../../modules/store/ducks/selectedKey');
// jest.unmock('../../../../../modules/store/ducks/ducks-utils/blankKeyDefinition');
jest.unmock('../../../../../modules/utils/http');
jest.unmock('../../../../../modules/store/ducks/ducks-utils/validations/key-name-validations');
jest.unmock('../../../../../modules/store/ducks/ducks-utils/validations/key-value-type-validations');
jest.unmock('../../../../../modules/services/TypesService');

jest.mock('../../../../../modules/store/ducks/ducks-utils/blankKeyDefinition', () => {
  return {
    BLANK_KEY_NAME: 'some key name',
    createBlankKey: () => ({
      keyDef: 'some key def',
      meta: 'some meta',
    }),
  };
});

import { openKey, saveKey, updateKeyValueType, updateKeyName } from '../../../../../modules/store/ducks/selectedKey';
import { createBlankKey, BLANK_KEY_NAME } from '../../../../../modules/store/ducks/ducks-utils/blankKeyDefinition';
import { assert, expect } from 'chai';
import fetchMock from 'fetch-mock';
import keyNameValidations from '../../../../../modules/store/ducks/ducks-utils/validations/key-name-validations';
import keyValueTypeValidations from '../../../../../modules/store/ducks/ducks-utils/validations/key-value-type-validations';

describe('selectedKey', async () => {

  const KEY_OPENED = 'KEY_OPENED';
  const KEY_OPENING = 'KEY_OPENING';
  const KEY_SAVED = 'KEY_SAVED';
  const KEY_SAVING = 'KEY_SAVING';
  const KEY_ADDED = 'KEY_ADDED';
  const TAGS_DOWNLOADED = 'TAGS_DOWNLOADED';
  const SHOW_KEY_VALIDATIONS = 'SHOW_KEY_VALIDATIONS';
  const KEY_VALUE_TYPE_CHANGE = 'KEY_VALUE_TYPE_CHANGE';
  const KEY_VALIDATION_CHANGE = 'KEY_VALIDATION_CHANGE';
  const KEY_NAME_CHANGE = 'KEY_NAME_CHANGE';

  let dispatchMock;
  let currentState;

  beforeEach(() => {
    dispatchMock = jest.fn();
    currentState = {};
  });

  afterEach(() => {
    fetchMock.restore();
  });

  const generateState = (openedKeyName, keyNameToAdd, validation = { isValid: true }) => {
    return {
      selectedKey: {
        key: openedKeyName,
        local: {
          key: keyNameToAdd,
          keyDef: 'some jpad',
        },
        validation: {
          ...validation
        },
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
      const keyOpenedDispatchAction = dispatchMock.mock.calls[1][0];
      expect(keyOpenedDispatchAction).to.deep.equal({ type: KEY_OPENED, payload: createBlankKey() }, 'should dispatch correct action');
    });

    it('should dispatch KEY_OPENING with correct payload', async () => {
      // Arrange
      const keyName = 'category/some key';

      // Act
      const func = openKey(keyName);
      await func(dispatchMock);

      // Assert
      assert(dispatchMock.mock.calls.length > 0, 'should call dispatch atleast once');

      const keyOpeningdDispatchAction = dispatchMock.mock.calls[1][0];
      expect(keyOpeningdDispatchAction).to.deep.equal({ type: KEY_OPENING, payload: keyName }, 'should dispatch correct action');
    });

    it('should dispatch KEY_OPENED with correct payload if GET succeeded', async () => {
      // Arrange
      const keyName = 'category/some key';

      const expectedKeyData = {
        keyDef: {
          source: 'some key def source',
          type: 'cs',
          valueType: 'string',
        },
        meta: {
          displayName: '',
          description: '',
          valueType: '',
        },
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
      const keyOpenedDispatchAction = dispatchMock.mock.calls[2][0];

      expect(keyOpenedDispatchAction).to.deep.equal({ type: KEY_OPENED, payload: expectedPayload }, 'should dispatch correct action');
    });

    it('should dispatch KEY_OPENED with correct payload if GET failed', async () => {
      // Arrange
      const keyName = 'category/some key';

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
      const keyOpenedDispatchAction = dispatchMock.mock.calls[2][0];
      expect(keyOpenedDispatchAction).to.deep.equal({ type: KEY_OPENED, payload: expectedPayload }, 'should dispatch correct action');
    });

    it('should dispatch TAGS_DOWNLOADED', async () => {
      // Arrange
      fetchMock.get('glob:*/api/tags', []);

      // Act
      const func = openKey('category/some key');
      await func(dispatchMock);

      // Assert
      const asyncDownloadTagsDispatchActionPromise = dispatchMock.mock.calls[0][0];
      const downloadTagsDispatchAction = await asyncDownloadTagsDispatchActionPromise;

      expect(downloadTagsDispatchAction).to.deep.equal({ type: TAGS_DOWNLOADED, payload: [] }, 'should dispatch correct action');
    });
  });

  describe('saveKey', () => {
    const saveKeyCommonFlowTest = (isNewKey) => it('should dispatch KEY_SAVING, fetch PUT key and dispatch KEY_SAVED', async () => {
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

    const saveKeyShouldShowValidationHints = (isNewKey) =>
      it('should not save the key and show the validation hints if the validation state is invalid',
        async () => {
          // Arrang
          const keyNameToSave = 'someCategory/someKeyName';

          const stateValidation = {
            isValid: false,
            meta: {
              someProperty: {
                someProperty2: {
                  isValid: false,
                  isShowingHint: false,
                  hint: 'pita',
                }
              }
            }
          };

          currentState = generateState(isNewKey ? BLANK_KEY_NAME : keyNameToSave,
            keyNameToSave,
            stateValidation);

          fetchMock.putOnce('glob:*/api/keys/*', {});

          // Act
          const func = saveKey();
          await func(dispatchMock, () => currentState);

          // Assert
          const showKeyValiadtionHintsDispatchAction = dispatchMock.mock.calls[0][0];

          expect(showKeyValiadtionHintsDispatchAction).to.deep.equal(
            { type: SHOW_KEY_VALIDATIONS }, 'should dispatch correct action');
        });

    describe('save new key', () => {
      saveKeyCommonFlowTest(true);
      saveKeyShouldShowValidationHints(true);

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
      saveKeyCommonFlowTest(false);
      saveKeyShouldShowValidationHints(false);

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

  describe('updateKeyValueType', () => {
    it('should dispatch actions correctly', async () => {
      // Arrange
      const keyValueType = 'pita';
      const expectedKeyValueTypeValidation = keyValueTypeValidations(keyValueType);
      expectedKeyValueTypeValidation.isShowingHint = true;

      const initializeState = generateState('some key', 'some new key');
      initializeState.keys = [];

      const expectedValidationPayload = {
        ...initializeState.selectedKey.validation,
        meta: {
          ...initializeState.selectedKey.validation.meta,
          valueType: expectedKeyValueTypeValidation,
        },
      };

      // Act
      const func = updateKeyValueType(keyValueType);
      await func(dispatchMock, () => initializeState);

      // Assert
      const keyValueTypeChangeDispatchAction = dispatchMock.mock.calls[0][0];

      expect(keyValueTypeChangeDispatchAction.type).to.deep.equal(KEY_VALUE_TYPE_CHANGE);
      expect(keyValueTypeChangeDispatchAction.payload).to.deep.equal(keyValueType);

      const keyValidationChangeDispatchAction = dispatchMock.mock.calls[1][0];
      expect(keyValidationChangeDispatchAction).to.deep.equal(
        { type: KEY_VALIDATION_CHANGE, payload: expectedValidationPayload }, 'should dispatch correct action');
    });
  });

  describe('updateKeyName', () => {
    it('should dispatch actions correctly', async () => {
      // Arrange
      const newKeyName = 'pita';

      const initializeState = generateState('some key', 'some new key');
      initializeState.keys = [];

      const expectedKeyNameValidation = keyNameValidations(newKeyName, []);
      expectedKeyNameValidation.isShowingHint = false;

      const expectedValidationPayload = {
        ...initializeState.selectedKey.validation,
        key: expectedKeyNameValidation,
      };

      // Act
      const func = updateKeyName(newKeyName);
      await func(dispatchMock, () => initializeState);

      // Assert
      const keyNameChangeDispatchAction = dispatchMock.mock.calls[0][0];

      expect(keyNameChangeDispatchAction.type).to.deep.equal(KEY_NAME_CHANGE);
      expect(keyNameChangeDispatchAction.payload).to.deep.equal(newKeyName);

      const keyValidationChangeDispatchAction = dispatchMock.mock.calls[1][0];

      expect(keyValidationChangeDispatchAction).to.deep.equal(
        { type: KEY_VALIDATION_CHANGE, payload: expectedValidationPayload }, 'should dispatch correct action');
    });
  });
});
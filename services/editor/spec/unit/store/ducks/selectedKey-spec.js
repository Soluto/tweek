/* global jest, beforeEach, describe, it, expect */
jest.unmock('../../../../src/store/ducks/tags');
jest.unmock('../../../../src/store/ducks/selectedKey');
jest.unmock('../../../../src/utils/http');
jest.unmock('../../../../src/store/ducks/ducks-utils/validations/key-name-validations');
jest.unmock('../../../../src/store/ducks/ducks-utils/validations/key-value-type-validations');
jest.unmock('../../../../src/services/types-service');
jest.unmock('../../../../src/services/context-service');
jest.unmock('../../../../src/store/ducks/ducks-utils/blankKeyDefinition');
jest.mock('../../../../src/store/ducks/alerts', () => {
  let result = true;
  const addAlert = dispatch => Promise.resolve({ result });
  return {
    setResult: r => (result = r),
    showCustomAlert: addAlert,
    showAlert: addAlert,
    showConfirm: addAlert,
  };
});

import {
  openKey,
  saveKey,
  updateKeyValueType,
  updateKeyName,
} from '../../../../src/store/ducks/selectedKey';
import {
  createBlankJPadKey,
  createBlankKeyManifest,
  BLANK_KEY_NAME,
} from '../../../../src/store/ducks/ducks-utils/blankKeyDefinition';
import { assert, expect } from 'chai';
import fetchMock from 'fetch-mock';
import keyNameValidations from '../../../../src/store/ducks/ducks-utils/validations/key-name-validations';
import keyValueTypeValidations from '../../../../src/store/ducks/ducks-utils/validations/key-value-type-validations';
import R from 'ramda';
import alerts from '../../../../src/store/ducks/alerts';

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
  const ADD_NOTIFICATION = 'ADD_NOTIFICATION';

  let dispatchMock;
  let currentState;

  function isFunction(functionToCheck) {
    let getType = {};
    return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
  }

  beforeEach(() => {
    dispatchMock = jest.fn((action) => {
      if (isFunction(action)) {
        return action(dispatchMock);
      }
      return action;
    });
    currentState = {};
  });

  afterEach(() => {
    fetchMock.restore();
  });

  const generateState = (openedKeyName, keyNameToAdd, keySource = '') => {
    const state = {
      selectedKey: {
        key: openedKeyName,
        local: {
          key: keyNameToAdd,
          keyDef: {
            source: '',
          },
        },
        validation: {
          isValid: true,
        },
      },
    };

    state.selectedKey.remote = R.clone(state.selectedKey.local);
    return state;
  };

  const doesDispatchPushTookAction = () =>
    dispatchMock.mock.calls
      .map(x => x[0])
      .some(x => x.payload && x.payload.method && x.payload.method === 'push');

  const doesSpecificDispatchTookAction = dispatchActionType =>
    dispatchMock.mock.calls.map(x => x[0]).some(x => x.type === dispatchActionType);

  const assertDispatchAction = (actualDispatchAction, expectedDispatchAction) => {
    expect(actualDispatchAction.type).to.deep.equal(
      expectedDispatchAction.type,
      'should dispatch correct action type',
    );

    expect(actualDispatchAction.payload).to.deep.equal(
      expectedDispatchAction.payload,
      'should dispatch correct action payload',
    );
  };

  describe('openKey', () => {
    beforeEach(() => {
      fetchMock.get('glob:*/api/tags', []);
      fetchMock.get('glob:*/api/schema/', {});
    });

    it('should dispatch KEY_OPENED with blank payload for blank key name', async () => {
      // Act
      const func = openKey(BLANK_KEY_NAME);
      await func(dispatchMock);

      // Assert
      const keyOpenedDispatchAction = dispatchMock.mock.calls[1][0];
      assertDispatchAction(keyOpenedDispatchAction, {
        type: KEY_OPENED,
        payload: createBlankJPadKey(),
      });
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
      assertDispatchAction(keyOpeningdDispatchAction, { type: KEY_OPENING, payload: keyName });
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
        manifest: {
          name: '',
          description: '',
          valueType: '',
        },
      };

      const expectedPayload = {
        key: keyName,
        manifest: expectedKeyData.manifest,
        keyDef: expectedKeyData.keyDef,
      };

      fetchMock.get('glob:*/api/keys/*', expectedKeyData);

      // Act
      const func = openKey(keyName);
      await func(dispatchMock);

      // Assert
      const keyOpenedDispatchAction = dispatchMock.mock.calls[2][0];
      assertDispatchAction(keyOpenedDispatchAction, { type: KEY_OPENED, payload: expectedPayload });
    });

    it('should dispatch KEY_OPENED and create key meta if meta does not exists', async () => {
      // Arrange
      const keyName = 'category/some key';

      const expectedKeyData = {
        keyDef: {
          source: 'some key def source',
          type: 'cs',
          valueType: 'string',
        },
      };

      const expectedPayload = {
        key: keyName,
        manifest: createBlankKeyManifest(),
        keyDef: expectedKeyData.keyDef,
      };

      fetchMock.get('glob:*/api/keys/*', expectedKeyData);

      // Act
      const func = openKey(keyName);
      await func(dispatchMock);

      // Assert
      const keyOpenedDispatchAction = dispatchMock.mock.calls[2][0];
      expect(keyOpenedDispatchAction.type).to.deep.equal(KEY_OPENED);
      expect(keyOpenedDispatchAction.payload.manifest).to.deep.equal(createBlankKeyManifest());
    });

    it('should dispatch KEY_OPENED with correct payload if GET failed', async () => {
      // Arrange
      const keyName = 'category/some key';

      const expectedPayload = {
        key: keyName,
      };

      fetchMock.get('glob:*/api/keys/*', { throws: 'some fetch exception' });

      // Act
      const func = openKey(keyName);
      await func(dispatchMock);

      // Assert
      const keyOpenedDispatchAction = dispatchMock.mock.calls[2][0];
      assertDispatchAction(keyOpenedDispatchAction, { type: KEY_OPENED, payload: expectedPayload });
    });

    it('should dispatch TAGS_DOWNLOADED', async () => {
      // Arrange
      const expectedTags = [{ name: 'pita' }];
      fetchMock.restore();
      fetchMock.get('glob:*/api/schema/', {});
      fetchMock.get('glob:*/api/tags', expectedTags);

      // Act
      const func = openKey('category/some key');
      await func(dispatchMock);

      // Assert
      const asyncDownloadTagsDispatchActionPromise = dispatchMock.mock.calls[0][0];
      const downloadTagsDispatchAction = await asyncDownloadTagsDispatchActionPromise;
      assertDispatchAction(downloadTagsDispatchAction, {
        type: TAGS_DOWNLOADED,
        payload: expectedTags,
      });
    });
  });

  describe('saveKey', () => {
    beforeEach(() => {
      fetchMock.get('glob:*/api/revision-history/*', []);
    });

    const saveKeyCommonFlowTest = (isNewKey, shouldSaveSucceed) =>
      it(`save succeess=${shouldSaveSucceed}, should dispatch KEY_SAVING, fetch PUT key and dispatch KEY_SAVED`, async () => {
        // Arrange
        const keyNameToSave = 'someCategory/someKeyName';
        currentState = generateState(isNewKey ? BLANK_KEY_NAME : keyNameToSave, keyNameToSave);

        const fetchResponse = shouldSaveSucceed ? { status: 200 } : { status: 500 };
        const matchName = 'glob:*/api/keys/*';
        fetchMock.putOnce(matchName, fetchResponse);

        // Act
        const func = saveKey();
        await func(dispatchMock, () => currentState);

        // Assert
        assert(fetchMock.done(matchName), 'should call fetch once');

        const fetchJsonDataString = fetchMock.lastOptions(matchName).body;
        assert(
          JSON.parse(fetchJsonDataString),
          currentState.selectedKey.local,
          'should pass correct data to fetch PUT',
        );

        let [[keySavingDispatchAction], [keySavedDispatchAction]] = dispatchMock.mock.calls;
        assertDispatchAction(keySavingDispatchAction, { type: KEY_SAVING });

        if (!shouldSaveSucceed) {
          const [_, [addNotificationDispatchAction]] = dispatchMock.mock.calls;
          assert.equal(
            ADD_NOTIFICATION,
            addNotificationDispatchAction.type,
            'should add error notification',
          );
          keySavedDispatchAction = dispatchMock.mock.calls[2][0];
        }

        assertDispatchAction(keySavedDispatchAction, {
          type: KEY_SAVED,
          payload: {
            keyName: keyNameToSave,
            isSaveSucceeded: shouldSaveSucceed,
          },
        });
      });

    const saveKeyShouldShowValidationHints = isNewKey =>
      it('should not save the key and show the validation hints if the validation state is invalid', async () => {
        // Arrang
        const keyNameToSave = 'someCategory/someKeyName';

        const stateValidation = {
          isValid: false,
          manifest: {
            someProperty: {
              someProperty2: {
                isValid: false,
                isShowingHint: false,
                hint: 'pita',
              },
            },
          },
        };

        currentState = generateState(isNewKey ? BLANK_KEY_NAME : keyNameToSave, keyNameToSave);
        currentState.selectedKey.validation = stateValidation;

        fetchMock.putOnce('glob:*/api/keys/*', {});

        // Act
        const func = saveKey();
        await func(dispatchMock, () => currentState);

        // Assert
        const showKeyValiadtionHintsDispatchAction = dispatchMock.mock.calls[0][0];
        assertDispatchAction(showKeyValiadtionHintsDispatchAction, { type: SHOW_KEY_VALIDATIONS });
      });

    describe('save new key', () => {
      saveKeyCommonFlowTest(true, true);
      saveKeyCommonFlowTest(true, false);
      saveKeyShouldShowValidationHints(true);

      it('should open the new saved key if there wasnt key change while saving', async () => {
        // Arrange
        const keyNameToSave = 'someCategory/someKeyName';

        currentState = generateState(BLANK_KEY_NAME, keyNameToSave);

        fetchMock.putOnce('glob:*/api/keys/*', {});
        fetchMock.get('glob:*/api/dependents/*', []);

        // Act
        const func = saveKey();
        await func(dispatchMock, () => currentState);

        assert(
          dispatchMock.mock.calls.length === 6,
          `should call dispatch 6 times, instead called ${dispatchMock.mock.calls.length} times`,
        );

        let keyAddedDispatchAction = dispatchMock.mock.calls[4][0];
        let pushDispatchAction = dispatchMock.mock.calls[5][0];
        assertDispatchAction(keyAddedDispatchAction, { type: KEY_ADDED, payload: keyNameToSave });

        const expectedPushPayload = {
          method: 'push',
          args: [`/keys/${keyNameToSave}`],
        };

        expect(pushDispatchAction.payload).to.deep.equal(
          expectedPushPayload,
          'should deliver correct push dispatch action payload',
        );
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
      saveKeyCommonFlowTest(false, true);
      saveKeyCommonFlowTest(false, false);
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
      initializeState.selectedKey.local.keyDef.source = JSON.stringify({
        partitions: [],
        rules: [],
      });
      initializeState.keys = [];

      const expectedValidationPayload = {
        ...initializeState.selectedKey.validation,
        manifest: {
          ...initializeState.selectedKey.validation.manifest,
          valueType: expectedKeyValueTypeValidation,
        },
      };

      // Act
      const func = updateKeyValueType(keyValueType);
      await func(dispatchMock, () => initializeState);

      // Assert
      const keyValueTypeChangeDispatchAction = dispatchMock.mock.calls[0][0];
      assertDispatchAction(keyValueTypeChangeDispatchAction, {
        type: KEY_VALUE_TYPE_CHANGE,
        payload: keyValueType,
      });

      const keyValidationChangeDispatchAction = dispatchMock.mock.calls[1][0];
      assertDispatchAction(keyValidationChangeDispatchAction, {
        type: KEY_VALIDATION_CHANGE,
        payload: expectedValidationPayload,
      });
    });

    it('should show confirm if there are existing rules values and only dispatch for confirm', async () => {
      // Arrange
      const keyValueType = 'pita';
      const expectedKeyValueTypeValidation = keyValueTypeValidations(keyValueType);
      expectedKeyValueTypeValidation.isShowingHint = true;

      const initializeState = generateState('some key', 'some new key');
      initializeState.selectedKey.local.keyDef.source = JSON.stringify({
        partitions: [],
        rules: [
          {
            Value: 'some rule value',
          },
        ],
      });

      initializeState.keys = [];

      alerts.setResult(false);

      // Act & Assert
      const func1 = updateKeyValueType(keyValueType);
      await func1(dispatchMock, () => initializeState);

      expect(dispatchMock.mock.calls.length).to.equal(1, 'should call confirm once');

      alerts.setResult(true);

      const func2 = updateKeyValueType(keyValueType);
      await func2(dispatchMock, () => initializeState);

      expect(dispatchMock.mock.calls.length).to.equal(4, 'should call confirm once');
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
      assertDispatchAction(keyNameChangeDispatchAction, {
        type: KEY_NAME_CHANGE,
        payload: newKeyName,
      });

      const keyValidationChangeDispatchAction = dispatchMock.mock.calls[1][0];
      assertDispatchAction(keyValidationChangeDispatchAction, {
        type: KEY_VALIDATION_CHANGE,
        payload: expectedValidationPayload,
      });
    });
  });
});

import cogoToast from 'cogo-toast';
import * as R from 'ramda';
import { tweekManagementClient } from '../../utils/tweekClients';
import { openKey, saveKey, changeKeyValueType, updateKeyPath } from './selectedKey';
import { createBlankJPadKey, BLANK_KEY_NAME } from './ducks-utils/blankKeyDefinition';
import keyValueTypeValidations from './ducks-utils/validations/key-value-type-validations';

jest.mock('./alerts', () => {
  let result = true;
  const addAlert = (dispatch) => Promise.resolve({ result });
  return {
    setResult: (r) => (result = r),
    showCustomAlert: addAlert,
    showAlert: addAlert,
    showConfirm: addAlert,
  };
});

jest.mock('../../utils/tweekClients');

jest.mock('cogo-toast');

describe('selectedKey', () => {
  const KEY_OPENED = 'KEY_OPENED';
  const KEY_OPENING = 'KEY_OPENING';
  const KEY_SAVED = 'KEY_SAVED';
  const KEY_SAVING = 'KEY_SAVING';
  const KEY_ADDED = 'KEY_ADDED';
  const TAGS_DOWNLOADED = 'TAGS_DOWNLOADED';
  const SHOW_KEY_VALIDATIONS = 'SHOW_KEY_VALIDATIONS';
  const KEY_VALUE_TYPE_CHANGE = 'KEY_VALUE_TYPE_CHANGE';
  const KEY_VALIDATION_CHANGE = 'KEY_VALIDATION_CHANGE';
  const KEY_PATH_CHANGE = 'KEY_PATH_CHANGE';
  const KEY_NAME_CHANGE = 'KEY_NAME_CHANGE';
  const ADD_NOTIFICATION = 'ADD_NOTIFICATION';

  const serverKeyDefinition = {
    implementation: '',
    manifest: {
      implementation: {
        type: 'file',
        format: 'jpad',
      },
    },
  };

  process.env.REACT_APP_GATEWAY_URL = 'http://gateway';

  let dispatchMock;
  let currentState;

  beforeEach(() => {
    dispatchMock = jest.fn((action) => {
      if (typeof action === 'function') {
        return action(
          dispatchMock,
          jest.fn().mockReturnValue({ selectedKey: { validation: { isValid: true } } }),
        );
      }
      return action;
    });
    currentState = {};

    jest.clearAllMocks();

    tweekManagementClient.saveKeyDefinition.mockResolvedValue();
    tweekManagementClient.getKeyDefinition.mockResolvedValue(serverKeyDefinition);
  });

  const generateState = (openedKeyName, keyNameToAdd) => {
    const state = {
      selectedKey: {
        key: openedKeyName,
        local: {
          key: keyNameToAdd,
          implementation: {
            source: '',
          },
          manifest: {
            key_path: keyNameToAdd,
            implementation: {
              type: 'file',
              format: 'jpad',
            },
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

  describe('openKey', () => {
    it('should dispatch KEY_OPENED with blank payload for blank key name', async () => {
      // Act
      const func = openKey(BLANK_KEY_NAME);
      await func(dispatchMock);

      // Assert
      expect(dispatchMock).toHaveBeenCalledWith({
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
      expect(dispatchMock).toHaveBeenCalledWith({
        type: KEY_OPENING,
        payload: keyName,
      });
    });

    it('should dispatch KEY_OPENED with correct payload if GET succeeded', async () => {
      // Arrange
      const keyName = 'category/some key';

      const expectedServerData = {
        implementation: 'some key def source',
        manifest: {
          key_path: 'test',
          meta: {
            name: '',
            description: '',
            valueType: '',
          },
          implementation: {
            type: 'file',
            format: 'jpad',
          },
        },
      };

      const expectedPayload = {
        key: keyName,
        implementation: {
          source: expectedServerData.implementation,
          type: 'jpad',
        },
        manifest: expectedServerData.manifest,
      };

      tweekManagementClient.getKeyDefinition.mockResolvedValue(expectedServerData);

      // Act
      const func = openKey(keyName);
      await func(dispatchMock);

      // Assert
      expect(dispatchMock).toHaveBeenCalledWith({
        type: KEY_OPENED,
        payload: expectedPayload,
      });
    });

    it('should dispatch KEY_OPENED with correct payload if GET failed', async () => {
      // Arrange
      const keyName = 'category/some key';

      const expectedPayload = {
        key: keyName,
      };

      tweekManagementClient.getKeyDefinition.mockRejectedValue(new Error());

      // Act
      const func = openKey(keyName);
      await func(dispatchMock);

      // Assert
      expect(dispatchMock).toHaveBeenCalledWith({
        type: KEY_OPENED,
        payload: expectedPayload,
      });
    });
  });

  describe('saveKey', () => {
    const saveKeyCommonFlowTest = (isNewKey, shouldSaveSucceed) =>
      it(`save succeess=${shouldSaveSucceed}, should dispatch KEY_SAVING, fetch PUT key and dispatch KEY_SAVED`, async () => {
        // Arrange
        const keyNameToSave = 'someCategory/someKeyName';
        currentState = generateState(isNewKey ? BLANK_KEY_NAME : keyNameToSave, keyNameToSave);

        if (!shouldSaveSucceed) {
          tweekManagementClient.saveKeyDefinition.mockRejectedValue(new Error('error'));
        } else {
          tweekManagementClient.saveKeyDefinition.mockResolvedValue();
        }

        // Act
        const func = saveKey();
        await func(dispatchMock, () => currentState);

        // Assert
        expect(tweekManagementClient.saveKeyDefinition).toHaveBeenCalledWith(keyNameToSave, {
          manifest: currentState.selectedKey.local.manifest,
          implementation: '',
        });

        expect(dispatchMock).toHaveBeenCalledWith({
          type: KEY_SAVING,
        });

        if (!shouldSaveSucceed) {
          expect(cogoToast.error).toHaveBeenCalledTimes(1);
        }

        expect(dispatchMock).toHaveBeenCalledWith({
          type: KEY_SAVED,
          payload: {
            keyName: keyNameToSave,
            isSaveSucceeded: shouldSaveSucceed,
          },
        });
      });

    const saveKeyShouldShowValidationHints = (isNewKey) =>
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

        // Act
        const func = saveKey();
        await func(dispatchMock, () => currentState);

        // Assert
        expect(dispatchMock).toHaveBeenCalledWith({ type: SHOW_KEY_VALIDATIONS });
      });

    describe('save new key', () => {
      saveKeyCommonFlowTest(true, true);
      saveKeyCommonFlowTest(true, false);
      saveKeyShouldShowValidationHints(true);

      it('should open the new saved key if there wasnt key change while saving', async () => {
        // Arrange
        const keyNameToSave = 'someCategory/someKeyName';

        currentState = generateState(BLANK_KEY_NAME, keyNameToSave);

        // Act
        const func = saveKey();
        await func(dispatchMock, () => currentState);

        expect(dispatchMock).toHaveBeenCalledWith(
          expect.objectContaining({
            type: KEY_ADDED,
            payload: expect.objectContaining({ key_path: keyNameToSave }),
          }),
        );

        const expectedPushPayload = {
          method: 'push',
          args: [`/keys/${keyNameToSave}`],
        };

        expect(dispatchMock).toHaveBeenCalledWith(
          expect.objectContaining({
            type: expect.stringMatching(/^@@router/),
            payload: expectedPushPayload,
          }),
        );
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

        // Act
        const func = saveKey();
        await func(dispatchMock, () => currentState);

        expect(dispatchMock).not.toHaveBeenCalledWith(
          expect.objectContaining({
            payload: expect.objectContaining({
              method: 'push',
            }),
          }),
        );

        expect(dispatchMock).not.toHaveBeenCalledWith(
          expect.objectContaining({
            type: KEY_ADDED,
          }),
        );
      });
    });
  });

  describe('changeKeyValueType', () => {
    it('should dispatch actions correctly', async () => {
      // Arrange
      const keyValueType = 'pita';
      const expectedKeyValueTypeValidation = keyValueTypeValidations(keyValueType);
      expectedKeyValueTypeValidation.isShowingHint = true;

      const initializeState = generateState('some key', 'some new key');
      initializeState.selectedKey.local.implementation.source = JSON.stringify({
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
      const func = changeKeyValueType(keyValueType);
      await func(dispatchMock, () => initializeState);

      // Assert
      expect(dispatchMock).toHaveBeenCalledWith({
        type: KEY_VALUE_TYPE_CHANGE,
        payload: keyValueType,
      });

      expect(dispatchMock).toHaveBeenCalledWith({
        type: KEY_VALIDATION_CHANGE,
        payload: expectedValidationPayload,
      });
    });
  });

  describe('updateKeyPath', () => {
    it('should dispatch actions correctly', async () => {
      // Arrange
      const newKeyName = 'pita';

      const initializeState = generateState('some key', 'some new key');
      initializeState.keys = [];

      const expectedKeyValidation = { isValid: true };
      const expectedValidationPayload = {
        ...initializeState.selectedKey.validation,
        key: expectedKeyValidation,
      };

      // Act
      const func = updateKeyPath(newKeyName, expectedKeyValidation);
      await func(dispatchMock, () => initializeState);

      // Assert
      expect(dispatchMock).toHaveBeenCalledWith({
        type: KEY_VALIDATION_CHANGE,
        payload: expectedValidationPayload,
      });

      expect(dispatchMock).toHaveBeenCalledWith({
        type: KEY_PATH_CHANGE,
        payload: newKeyName,
      });

      expect(dispatchMock).toHaveBeenCalledWith({
        type: KEY_NAME_CHANGE,
        payload: newKeyName,
      });
    });
  });
});

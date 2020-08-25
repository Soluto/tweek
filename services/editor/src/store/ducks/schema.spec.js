/* global describe, beforeAll, beforeEach, it, afterEach process fetch jest */
jest.mock('../../utils/tweekClients');

import promiseMiddleware from 'redux-promise';
import thunk from 'redux-thunk';
import jsonpatch from 'fast-json-patch';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import * as R from 'ramda';
import { tweekManagementClient } from '../../utils/tweekClients';
import reducer, * as actions from './schema';

describe('schema duck', () => {
  let schemaState, dispatch;

  beforeEach(() => {
    let store = createStore(
      combineReducers({ schema: reducer }),
      {},
      applyMiddleware(thunk, promiseMiddleware),
    );
    dispatch = store.dispatch;
    store.subscribe(() => (schemaState = store.getState().schema));
  });

  describe('add new identity', () => {
    it('identity should be added to the state', () => {
      dispatch(actions.addNewIdentity('user'));
      expect(schemaState).toMatchObject({
        user: { local: {}, remote: null, isSaving: false },
      });
    });
  });

  describe('Manage identity properties', () => {
    it('identity property can be added or updated', () => {
      dispatch(actions.addNewIdentity('user'));
      dispatch(actions.upsertIdentityProperty('user', 'age', 30));
      expect(schemaState).toMatchObject({
        user: { local: { age: 30 } },
      });
      dispatch(actions.upsertIdentityProperty('user', 'age', 40));
      expect(schemaState).toMatchObject({
        user: { local: { age: 40 } },
      });
    });

    it('identity property can be removed', () => {
      dispatch(actions.addNewIdentity('user'));
      dispatch(actions.upsertIdentityProperty('user', 'age', 30));
      expect(schemaState).toMatchObject({
        user: { local: { age: 30 } },
      });
      dispatch(actions.removeIdentityProperty('user', 'age'));
      expect(schemaState).not.toHaveProperty(['user', 'local', 'age']);
    });
  });

  describe('Remote Updates', () => {
    it('saving new identity', async () => {
      dispatch(actions.addNewIdentity('user'));
      dispatch(actions.upsertIdentityProperty('user', 'age', 30));
      const savePromise = dispatch(actions.saveSchema('user'));

      expect(schemaState).toMatchObject({
        user: { isSaving: true },
      });

      await savePromise;

      expect(schemaState).toMatchObject({
        user: { isSaving: false },
      });

      expect(tweekManagementClient.saveIdentity).toHaveBeenCalledWith('user', { age: 30 });

      expect(schemaState).toMatchObject({
        user: { remote: { age: 30 } },
      });
    });

    it('updating existing identity', async () => {
      dispatch(actions.addNewIdentity('user'));
      dispatch(actions.upsertIdentityProperty('user', 'age', 30));

      await dispatch(actions.saveSchema('user'));

      const oldUserState = R.clone(schemaState.user.local);

      dispatch(actions.upsertIdentityProperty('user', 'age', 40));
      dispatch(actions.upsertIdentityProperty('user', 'gender', 'female'));

      await dispatch(actions.saveSchema('user'));
      const [_, patch] = tweekManagementClient.patchIdentity.mock.calls[0];

      const newUserState = R.clone(schemaState.user.local);
      expect(newUserState).toMatchObject({ age: 40, gender: 'female' });

      const patchedState = jsonpatch.applyPatch(oldUserState, patch).newDocument;
      expect(patchedState).toEqual(newUserState);
    });

    it('delete existing identity', async () => {
      dispatch(actions.addNewIdentity('user'));
      dispatch(actions.upsertIdentityProperty('user', 'age', 30));

      await dispatch(actions.deleteIdentity('user'));

      expect(tweekManagementClient.deleteIdentity).toHaveBeenCalledWith('user');
      expect(schemaState).not.toHaveProperty('user');
    });
  });
});

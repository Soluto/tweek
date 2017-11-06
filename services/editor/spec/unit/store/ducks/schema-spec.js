/* global describe, beforeEach, it, afterEach */
import promiseMiddleware from 'redux-promise';
import thunk from 'redux-thunk';
import jsonpatch from 'fast-json-patch';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import * as R from 'ramda';
import { expect } from 'chai';
import reducer, * as actions from '../../../../src/store/ducks/schema';

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
      expect(schemaState)
        .to.have.property('user')
        .to.deep.include({ local: {}, remote: null, isSaving: false });
    });
  });

  describe('Manage identity properties', () => {
    it('identity property can be added or updated', () => {
      dispatch(actions.addNewIdentity('user'));
      dispatch(actions.upsertIdentityProperty('user', 'age', 30));
      expect(schemaState)
        .to.have.property('user')
        .to.deep.include({ local: { age: 30 } });
      dispatch(actions.upsertIdentityProperty('user', 'age', 40));
      expect(schemaState)
        .to.have.property('user')
        .to.deep.include({ local: { age: 40 } });
    });

    it('identity property can be removed', () => {
      dispatch(actions.addNewIdentity('user'));
      dispatch(actions.upsertIdentityProperty('user', 'age', 30));
      expect(schemaState)
        .to.have.property('user')
        .to.deep.include({ local: { age: 30 } });
      dispatch(actions.removeIdentityProperty('user', 'age'));
      expect(schemaState)
        .to.have.property('user')
        .with.property('local')
        .to.not.have.property('age');
    });
  });

  describe('Remote Updates', () => {
    let originalFetch = global.fetch;
    beforeEach(() => {
      global.fetch = jest.fn(async (url, fetchArgs) => {
        fetchArgs = fetchArgs || { method: 'get' };
        if (fetchArgs.url === '/api/schemas' && fetchArgs.method.toUpperCase() === 'GET') {
          return { ok: true, json: async () => R.map(x => x.remote)(schemaState) };
        }
        return { ok: true, json: async () => ({}) };
      });
    });
    afterEach(() => {
      global.fetch = originalFetch;
    });

    it('saving new identity', async () => {
      dispatch(actions.addNewIdentity('user'));
      dispatch(actions.upsertIdentityProperty('user', 'age', 30));
      const savePromise = dispatch(actions.saveSchema('user'));
      expect(schemaState)
        .to.have.property('user')
        .with.property('isSaving', true);
      await savePromise;
      expect(schemaState)
        .to.have.property('user')
        .with.property('isSaving', false);
      let [url, { method, body }] = fetch.mock.calls[0];
      expect(url.toLowerCase()).to.eq('/api/schemas/user');
      expect(method).to.eq('POST');
      expect(JSON.parse(body)).to.deep.equal({ age: 30 });
      expect(schemaState)
        .to.have.property('user')
        .with.property('remote')
        .deep.eq({ age: 30 });
    });

    it('updating existing identity', async () => {
      dispatch(actions.addNewIdentity('user'));
      dispatch(actions.upsertIdentityProperty('user', 'age', 30));
      await dispatch(actions.saveSchema('user'));
      const oldUserState = R.clone(schemaState.user.local);
      dispatch(actions.upsertIdentityProperty('user', 'age', 40));
      dispatch(actions.upsertIdentityProperty('user', 'gender', 'female'));
      await dispatch(actions.saveSchema('user'));
      const [_, { body }] = fetch.mock.calls.find(
        ([url, { method }]) => method === 'PATCH' && url === '/api/schemas/user',
      );
      const patch = JSON.parse(body);
      const newUserState = R.clone(schemaState.user.local);
      expect(newUserState).to.deep.include({ age: 40, gender: 'female' });
      const patchedState = jsonpatch.applyPatch(oldUserState, patch).newDocument;
      expect(patchedState).to.deep.equal(newUserState);
    });

    it('delete existing identity', async () => {
      dispatch(actions.addNewIdentity('user'));
      dispatch(actions.upsertIdentityProperty('user', 'age', 30));
      await dispatch(actions.deleteIdentity('user'));
      let [url, { method }] = fetch.mock.calls[0];
      expect(url.toLowerCase()).to.eq('/api/schemas/user');
      expect(method).to.eq('DELETE');
      expect(schemaState).to.not.have.property('user');
    });
  });
});

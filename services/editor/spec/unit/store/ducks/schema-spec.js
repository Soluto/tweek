import promiseMiddleware from 'redux-promise';
import thunk from 'redux-thunk';
//import { getSchema, refreshSchema } from '../../services/context-service';
//import fetch from '../../utils/fetch';
import { push } from 'react-router-redux';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import R from 'ramda';
import reducer, * as actions from '../../../../src/store/ducks/schema';
import { expect as chaiExpect } from 'chai';
const jestExpect = expect;
expect = chaiExpect;

describe('schema duck', () => {
  let state, dispatch;
  beforeEach(() => {
    let store = createStore(
      combineReducers({ schema: reducer }),
      {},
      applyMiddleware(thunk, promiseMiddleware),
    );
    dispatch = store.dispatch;
    store.subscribe(() => (state = store.getState().schema));
  });

  describe('add new identity', () => {
    it('identity should be added to the state', () => {
      dispatch(actions.addNewIdentity('user'));
      expect(state).to.have
        .property('user')
        .to.deep.include({ local: {}, remote: null, isSaving: false });
    });
  });

  describe('Manage identity properties', () => {
    it('identity property can be added', () => {
      dispatch(actions.addNewIdentity('user'));
      dispatch(actions.upsertIdentityProperty('user', 'age', 30));
      expect(state).to.have.property('user').to.deep.include({ local: { age: 30 } });
    });

    it('identity property can be updated', () => {
      dispatch(actions.addNewIdentity('user'));
      dispatch(actions.upsertIdentityProperty('user', 'age', 30));
      expect(state).to.have.property('user').to.deep.include({ local: { age: 30 } });
      dispatch(actions.upsertIdentityProperty('user', 'age', 40));
      expect(state).to.have.property('user').to.deep.include({ local: { age: 40 } });
    });

    it('identity property can be removed', () => {
      dispatch(actions.addNewIdentity('user'));
      dispatch(actions.upsertIdentityProperty('user', 'age', 30));
      expect(state).to.have.property('user').to.deep.include({ local: { age: 30 } });
      dispatch(actions.removeIdentityProperty('user', 'age'));
      expect(state).to.have.property('user').to.not.deep.include({ local: { age: 30 } });
    });
  });

  describe('Remote Updates', () => {
    let originalFetch = global.fetch;
    beforeEach((fetchArgs) => {
      global.fetch = jest.fn(async (url, fetchArgs) => {
        fetchArgs = fetchArgs || { method: 'get' };
        console.log(url, fetchArgs);
        if (fetchArgs.url === '/api/schema' && fetchArgs.method.toUpperCase() === 'GET') {
          return { ok: true, json: async () => R.map(x => x.remote)(state) };
        }
        return { ok: true, json: async () => ({}) };
      });
    });
    afterEach(() => {
      global.fetch = originalFetch;
    });
    it.only('simple async test', async () => {
      jestExpect.assertions(1);
      await Promise.resolve();
      jestExpect(true).toEqual(true);
    });

    it('saving new identity', async () => {
      jestExpect.assertions(1);
      dispatch(actions.addNewIdentity('user'));
      dispatch(actions.upsertIdentityProperty('user', 'age', 30));
      const savePromise = Promise.resolve(); // dispatch(actions.saveSchema("user"));
      await savePromise;
      jestExpect(fetch.mock.calls).toHaveLength(2);
    });
  });
});

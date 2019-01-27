import { createStore, applyMiddleware, compose } from 'redux';
import { routerMiddleware } from 'react-router-redux';
import promiseMiddleware from 'redux-promise';
import thunk from 'redux-thunk';
import rootReducer from './rootReducer';
import browserHistory from './browserHistory';

export default function configureStore(initialState) {
  return createStore(
    rootReducer,
    initialState,
    compose(
      applyMiddleware(thunk, promiseMiddleware),
      applyMiddleware(routerMiddleware(browserHistory)),
      typeof window === 'object' && typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined'
        ? window.__REDUX_DEVTOOLS_EXTENSION__()
        : f => f,
    ),
  );
}

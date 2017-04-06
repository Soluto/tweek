import './styles/styles.css';
import React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';
import App from './components/App';
import KeysPage from './pages/keys/components/KeysPage/KeysPage';
import KeyPage from './pages/keys/components/KeyPage/KeyPage';
import SchemaPage from './pages/identities/components/SchemaPage/SchemaPage';
import IdentityPage from './pages/identities/components/IdentityPage/IdentityPage';
import NoMatch from './components/NoMatch';
import style from './styles/styles.css';

const SelectKeyMessage = () => <div className={style['select-key-message']}>Select key...</div>;

export default serverRoutes => (
  <Route>
    <Redirect from="/" to="keys" />
    <Route path="/" component={App}>
      <Route path="keys" component={KeysPage} >
        <IndexRoute component={() => <SelectKeyMessage />} />
        <Route path="*" component={KeyPage} />
      </Route>
      <Route path="schema" component={SchemaPage} >
        <Route path=":identity" component={IdentityPage} />
      </Route>
    </Route>
    {serverRoutes}
    <Route path="*" status={404} component={NoMatch} />
  </Route>
);

import React from 'react';
import { Route, IndexRoute, Redirect } from 'react-router';
import App from './components/App';
import KeysPage from './pages/keys/components/KeysPage/KeysPage';
import KeyPage from './pages/keys/components/KeyPage/KeyPage';
import ContextPage from './pages/context/components/ContextPage/ContextPage';
import IdentityDetails from './pages/context/components/IdentityDetails/IdentityDetails';
import NoMatch from './components/NoMatch';
import style from './styles/styles.css';
import './styles/styles.css';

const SelectKeyMessage = () => <div className={style['select-key-message']}>Select key...</div>;

export default serverRoutes => (
  <Route>
    <Redirect from="/" to="keys" />
    <Route path="/" component={App}>
      <Route path="keys" component={KeysPage} >
        <IndexRoute component={() => <SelectKeyMessage />} />
        <Route path="*" component={KeyPage} />
      </Route>
      <Route path="context" component={ContextPage} >
        <Route path=":identityName/:identityId" component={IdentityDetails} />
      </Route>
    </Route>
    {serverRoutes}
    <Route path="*" status={404} component={NoMatch} />
  </Route>
);

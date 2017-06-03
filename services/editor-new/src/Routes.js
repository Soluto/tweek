import React from 'react';
import { Switch, Route, Redirect } from 'react-router';
import { BrowserRouter } from 'react-router-dom'
import App from './components/App';
import KeysPage from './pages/keys/components/KeysPage/KeysPage';
import KeyPage from './pages/keys/components/KeyPage/KeyPage';
import ContextPage from './pages/context/components/ContextPage/ContextPage';
import IdentityDetails from './pages/context/components/IdentityDetails/IdentityDetails';
import NoMatch from './components/NoMatch';
import style from './styles/styles.css';
import './styles/styles.css';

const SelectKeyMessage = () => <div className={style['select-key-message']}>Select key...</div>;

export default props => (
    <BrowserRouter>
            <App>
                <Switch>
                    <Route path="/" exact>
                        <Redirect to="/keys"/>
                    </Route>
                    <Route path="/keys" component={KeysPage}>
                        <Switch>
                            <Route exact path="/" component={SelectKeyMessage} />
                            <Route component={KeyPage} />
                        </Switch>
                    </Route>
                    <Route path="/context" component={ContextPage}>
                        <Route path=":identityName/:identityId" component={IdentityDetails} />
                    </Route>
                    <Route status={404} component={NoMatch} />
                </Switch>
            </App>
    </BrowserRouter>
);

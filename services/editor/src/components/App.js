import React from 'react';
import { Link } from 'react-router-dom';
import { Route } from 'react-router';
import { Observable } from 'rxjs/Rx';
import { setObservableConfig, compose } from 'recompose';
import classNames from 'classnames';
import withLoading from '../hoc/with-loading';
import { refreshSchema } from '../services/context-service';
import * as TypesService from '../services/types-service';
import Alerts from './alerts/Alerts';
import Notifications from './alerts/Notifications';
import { withTypesService } from './common/Input/TypedInput';
import logoSrc from './resources/logo.svg';
import '../styles/core/fonts/fonts.css';
import './App.css';

setObservableConfig({
  fromESObservable: Observable.from,
});

const ListItemLink = ({ to, ...rest }) => (
  <Route
    path={to}
    children={({ match }) => (
      <li>
        <Link
          className={classNames('menu-item', {
            'selected-location-path': match,
          })}
          to={to}
          {...rest}
        />
      </li>
    )}
  />
);

export default compose(
  withLoading(() => null, () => Promise.all([TypesService.refreshTypes(), refreshSchema()])),
  withTypesService(TypesService),
)(({ children }) => (
  <div className={'app'}>
    <div className={'header'}>
      <Link to="/" replace>
        <img className={'logo'} src={logoSrc} />
      </Link>
      <ul className={'menu'}>
        <ListItemLink to="/keys">
          <img src={require('./resources/keys.svg')} />
          <span>Keys</span>
        </ListItemLink>
        <ListItemLink to="/context">
          <img src={require('./resources/context.svg')} />
          <span>Context</span>
        </ListItemLink>
        <ListItemLink to="/settings">
          <img src={require('./resources/settings.svg')} />
          <span>Settings</span>
        </ListItemLink>
      </ul>
    </div>
    <div className={'page'}>
      {children}
      <Alerts />
      <Notifications />
    </div>
  </div>
));

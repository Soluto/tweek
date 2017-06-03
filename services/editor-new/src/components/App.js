import React from 'react';
import { Link } from 'react-router-dom';
import { Route } from 'react-router';
import Title from 'react-title-component';
import { Tabs } from 'react-tabs';
import { Observable } from 'rxjs/Rx';
import { setObservableConfig } from 'recompose';
import classNames from 'classnames';
import logoSrc from './resources/logo.svg';
import Alerts from './alerts/Alerts';
import Notifications from './alerts/Notifications';
import style from './App.css';
import * as TypesService from '../services/types-service';
import { withTypesService } from './common/Input/TypedInput';

require('../styles/core/fonts/fonts.css');

setObservableConfig({
  fromESObservable: Observable.from,
});
Tabs.setUseDefaultStyles(false);

const ListItemLink = ({ to, ...rest }) => (
    <Route path={to} children={({ match }) => (
        <li>
            <Link
                className={classNames(style['menu-item'], {
                    [style['selected-location-path']]: match,
                })}
                to={to}
                {...rest}/>
        </li>
    )}/>
)

export default withTypesService(TypesService)(({ children }) => (
  <div className={style.app}>
    <div className={style.header}>
      <Title render="Tweek" />
      <Link to="/" replace><img className={style.logo} src={logoSrc} /></Link>
      <ul className={style.menu}>
          <ListItemLink to="/keys">
              <img src={require('./resources/keys.svg')} />
              <span>Keys</span>
          </ListItemLink>
          <ListItemLink to="/context">
              <img src={require('./resources/keys.svg')} />
              <span>Context</span>
          </ListItemLink>
      </ul>
    </div>
    <div className={style.page}>
      {children}
      <Alerts />
      <Notifications />
    </div>
  </div>
));

import React from 'react';
import { IndexLink, Link } from 'react-router';
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

export default withTypesService(TypesService)(({ location: { pathname }, children }) => (
  <div className={style.app}>
    <div className={style.header}>
      <Title render="Tweek" />
      <IndexLink to="/"><img className={style.logo} src={logoSrc} /></IndexLink>
      <ul className={style.menu} >
        <li>
          <Link className={classNames(style['menu-item'], { [style['selected-location-path']]: pathname.startsWith('/keys') })} to="/keys">
            <img src={require('./resources/keys.svg')} />
            <span>Keys</span>
            </Link>
        </li>
        <li>
          <Link className={classNames(style['menu-item'], { [style['selected-location-path']]: pathname.startsWith('/context') })} to="/context">
            <img src={require('./resources/keys.svg')} />
            <span>Context</span>
          </Link>
        </li>
      </ul>
    </div>
    <div className={style.page}>
      {children}
      <Alerts />
      <Notifications />
    </div>
  </div>
  ));


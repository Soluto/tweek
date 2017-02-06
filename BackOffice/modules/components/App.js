import React from 'react';
import { IndexLink, Link } from 'react-router';
import Title from 'react-title-component';
import style from './App.css';
import { Tabs } from 'react-tabs';
import { Observable } from 'rxjs/Rx';
import { setObservableConfig } from 'recompose';
import classNames from 'classnames';
import logoSrc from './resources/logo.svg';
require('../styles/core/fonts/fonts.css');

setObservableConfig({
  fromESObservable: Observable.from,
});
Tabs.setUseDefaultStyles(false);

export default (({ location: { pathname }, children }) => {
  return (
    <div className={style['app']}>
      <div className={style['header']}>
        <Title render="Tweek" />
        <IndexLink to="/"><img className={style['logo']} src={logoSrc} /></IndexLink>
        <ul className={style['menu']} >
          <li className={classNames(style['menu-item'], { [style['selected-location-path']]: pathname.startsWith('/keys') })}>
            <img src={require("./resources/keys.svg")} />
            <Link to="/keys">Keys</Link>
          </li>
        </ul>
      </div>
      <div className={style['page']}>
        {children}
      </div>
    </div>
  );
});


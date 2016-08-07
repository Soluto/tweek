import React from 'react';
import { IndexLink, Link } from 'react-router';
import Title from 'react-title-component';
import style from './App.css';
import logo from './logo.png';
import { Tabs } from 'react-tabs';
import { Observable } from 'rxjs/Rx';
import { setObservableConfig } from 'recompose';

setObservableConfig({
  fromESObservable: Observable.from,
});
Tabs.setUseDefaultStyles(false);

export default React.createClass({
  render() {
    return (
      <div className={style['app']}>
        <div className={style['header']}>
          <Title render="Tweek"/>
          <IndexLink to="/"><img className={style['logo']} src={logo} /></IndexLink>
          <ul className={style['menu']} >
            <li><Link to="/keys">keys</Link></li>
          </ul>
        </div>
        {this.props.children}
      </div>
    );
  },
});


import React from 'react';
import { IndexLink, Link } from 'react-router';
import Title from 'react-title-component';
import styles from './App.css';
import logo from './logo.png';
import { Tabs } from 'react-tabs';

Tabs.setUseDefaultStyles(false);

export default React.createClass({
  render() {
    return (
      <div className={styles.app}>
        <div className={styles.header}>
          <Title render="Tweek"/>
          <IndexLink to="/"><img src={logo} /></IndexLink>
          <ul className={styles.menu} >
            <li><Link to="/keys">keys</Link></li>
          </ul>
        </div>
        {this.props.children}
      </div>
    );
  },
});


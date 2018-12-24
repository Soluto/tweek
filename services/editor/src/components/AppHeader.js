import React from 'react';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import {compose, lifecycle, withState} from 'recompose';
import logoSrc from './resources/logo.png';
import withSecurityPageIsEnabled from '../pages/security/withSecurityPageIsEnabled';
import '../styles/core/fonts/fonts.css';
import '../pages/security/components/SecurityPage'
import './App.css';

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

const AppHeader = ({securityTabIsEnabled}) => (
  <div className={'header'}>
    <Link to="/" replace>
      <img className={'logo'} src={logoSrc} alt={''} />
    </Link>
    <ul className={'menu'}>
      <ListItemLink to="/keys">
        <img src={require('./resources/keys.svg')} alt={''} />
        <span>Keys</span>
      </ListItemLink>
      <ListItemLink to="/context">
        <img src={require('./resources/context.svg')} alt={''} />
        <span>Context</span>
      </ListItemLink>
      { 
        securityTabIsEnabled ?
          <ListItemLink to="/security">
            <img src={require('./resources/security.svg')} alt={''} />
            <span style={{marginLeft: '10px'}}>Security</span>
          </ListItemLink>
          :
          null
      }
      <ListItemLink to="/settings">
        <img src={require('./resources/settings.svg')} alt={''} />
        <span>Settings</span>
      </ListItemLink>
    </ul>
  </div>
);

export default compose(
  withSecurityPageIsEnabled('securityTabIsEnabled'),
)(AppHeader);

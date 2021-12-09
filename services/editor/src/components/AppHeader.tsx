import React, { FunctionComponent } from 'react';
import { Route } from 'react-router';
import { Link } from 'react-router-dom';
import classNames from 'classnames';
import logoSrc from './resources/logo.svg';
import '../styles/core/fonts/fonts.css';
import './App.css';
import UserBar from './UserBar';
import keysIcon from './resources/keys.svg';
import contextIcon from './resources/context.svg';
import settingsIcon from './resources/settings.svg';

type ListItemLinkProps = {
  to: string;
};

const ListItemLink: FunctionComponent<ListItemLinkProps> = ({ to, ...rest }) => (
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

const AppHeader = () => (
  <div className={'header'}>
    <Link to="/" replace>
      <img className={'logo'} src={logoSrc} alt={''} />
    </Link>

    <div style={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 1 }}>
      <ul className={'menu'}>
        <ListItemLink to="/keys">
          <img src={keysIcon} alt={''} />
          <span>Keys</span>
        </ListItemLink>
        <ListItemLink to="/context">
          <img src={contextIcon} alt={''} />
          <span>Context</span>
        </ListItemLink>
        <ListItemLink to="/settings">
          <img src={settingsIcon} alt={''} />
          <span>Settings</span>
        </ListItemLink>
      </ul>
      <div>
        <UserBar />
      </div>
    </div>
  </div>
);

export default AppHeader;

import React from 'react';

import Alerts from './alerts/Alerts';
import Notifications from './alerts/Notifications';
import '../styles/core/fonts/fonts.css';
import './App.css';

const AppPage = ({ children }) =>
  (<div className={'page'}>
    {children}
    <Alerts />
    <Notifications />
  </div>);

export default AppPage;
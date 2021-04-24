import React from 'react';

import Alerts from './alerts/Alerts';
import '../styles/core/fonts/fonts.css';
import './App.css';

const AppPage = ({ children }) => (
  <div className={'page'}>
    {children}
    <Alerts />
  </div>
);

export default AppPage;

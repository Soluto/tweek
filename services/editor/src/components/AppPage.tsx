import React, { FunctionComponent } from 'react';

import Alerts from './alerts/Alerts';
import '../styles/core/fonts/fonts.css';
import './App.css';

const AppPage: FunctionComponent = ({ children }) => (
  <div className={'page'}>
    {children}
    <Alerts />
  </div>
);

export default AppPage;

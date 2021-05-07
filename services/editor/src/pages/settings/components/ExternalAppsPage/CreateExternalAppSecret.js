import React from 'react';
import { buttons } from '../../../../contexts/Alerts';
import './CreateExternalAppSecret.css';

const Component = ({ appId, appSecret }) => (
  <div>
    <div className="note">
      Write out the application id and the secret before closing this window.
    </div>
    <div className="field-wrapper">
      <label className="field-label">App Id:</label>
      <div>{appId}</div>
    </div>
    <div className="field-wrapper">
      <label className="field-label">Secret:</label>
      <div className="long-text">{appSecret}</div>
    </div>
  </div>
);

const createExternalAppSecret = (appId, appSecret) => ({
  title: 'Important!',
  component: () => <Component appId={appId} appSecret={appSecret} />,
  buttons: [buttons.OK],
});

export default createExternalAppSecret;

import React from 'react';
import DocumentTitle from 'react-document-title';
import './SettingsPage.css';
import Versions from './Versions';
import IdentitiesMenu from './IdentitiesMenu';

const SettingsPage = ({ children }) => (
  <DocumentTitle title="Tweek - Settings">
    <div className="schema-page-container">
      <div style={{ display: 'flex', flexDirection: 'column', flexBasis: 400 }}>
        <IdentitiesMenu />
        <Versions />
      </div>
      <div style={{ display: 'flex', flexGrow: 1, overflowY: 'auto' }} key="Page">
        {children}
      </div>
    </div>
  </DocumentTitle>
);

export default SettingsPage;

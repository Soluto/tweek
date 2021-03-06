import React, { FunctionComponent, useEffect, useState } from 'react';
import DocumentTitle from 'react-document-title';
import { useHotkeys } from 'react-hotkeys-hook';
import { RouteComponentProps } from 'react-router';
import { useLoadKeys } from '../../../../contexts/AllKeys';
import { useRefreshSchemas } from '../../../../contexts/Schema/Schemas';
import { createUseSelectedKey } from '../../../../contexts/SelectedKey';
import { BLANK_KEY_NAME } from '../../../../contexts/SelectedKey/blankKeyDefinition';
import { useLoadTags } from '../../../../contexts/Tags';
import withLoading from '../../../../hoc/with-loading';
import { refreshTypes } from '../../../../services/types-service';
import KeysList from '../KeysList/KeysList';
import QuickNavigation from '../QuickNavigation/QuickNavigation';
import './KeysPage.css';

export type KeysPageProps = Pick<RouteComponentProps, 'location' | 'history'> & {
  isExact: boolean;
};

const useSelectedKey = createUseSelectedKey((key) => key.remote?.manifest?.key_path);

const KeysPage: FunctionComponent<KeysPageProps> = ({ location, history, isExact, children }) => {
  useRefreshSchemas();
  useLoadTags();
  useLoadKeys();

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname, location.search]);

  const [navOpen, setNavOpen] = useState(false);

  const selectedKey = useSelectedKey();

  useHotkeys(
    'ctrl+k',
    () => {
      setNavOpen((x) => !x);
    },
    { filter: (_) => true },
  );

  return (
    <DocumentTitle title={`Tweek - ${isExact ? 'Keys' : selectedKey || 'New Key'}`}>
      <div className="keys-page-container">
        <div key="KeysList" className="keys-list">
          <div className="keys-list-wrapper">
            <KeysList selectedKey={selectedKey} />
          </div>
          <div className="add-button-wrapper">
            <button
              className="add-key-button"
              data-comp="add-new-key"
              onClick={() => history.push(`/keys/${BLANK_KEY_NAME}`)}
            >
              Add key
            </button>
          </div>
        </div>
        <div key="Page" className="key-page" data-comp="key-page">
          {navOpen && (
            <QuickNavigation
              push={(x) => {
                history.push(x);
                setNavOpen(false);
              }}
              onBlur={() => setNavOpen(false)}
            />
          )}
          {children}
        </div>
      </div>
    </DocumentTitle>
  );
};

const enhance = withLoading(refreshTypes);

export default enhance(KeysPage);

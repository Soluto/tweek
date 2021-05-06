import React, { FunctionComponent, PropsWithChildren, useEffect, useState } from 'react';
import DocumentTitle from 'react-document-title';
import { useHotkeys } from 'react-hotkeys-hook';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { useLoadKeys } from '../../../../contexts/AllKeys';
import { useLoadTags } from '../../../../contexts/Tags';
import withLoading from '../../../../hoc/with-loading';
import { refreshSchema } from '../../../../services/context-service';
import { refreshTypes } from '../../../../services/types-service';
import { addKey } from '../../../../store/ducks/selectedKey';
import { KeyActions, StoreState } from '../../../../store/ducks/types';
import KeysList from '../KeysList/KeysList';
import QuickNavigation from '../QuickNavigation/QuickNavigation';
import hasUnsavedChanges from '../utils/hasUnsavedChanges';
import './KeysPage.css';

type StateProps = Pick<StoreState, 'selectedKey'>;
type Actions = Pick<KeyActions, 'addKey'>;

const enhance = connect<StateProps, Actions, PropsWithChildren<{}>, StoreState>(
  (state) => ({ selectedKey: state.selectedKey }),
  {
    addKey,
  },
);

export type KeysPageProps = StateProps &
  Actions &
  Pick<RouteComponentProps, 'location' | 'history'>;

const KeysPage: FunctionComponent<KeysPageProps> = ({
  selectedKey,
  addKey,
  location,
  history,
  children,
}) => {
  useLoadTags();
  useLoadKeys();

  useEffect(() => {
    setNavOpen(false);
  }, [location.pathname, location.search]);

  const [navOpen, setNavOpen] = useState(false);
  useHotkeys(
    'ctrl+k',
    () => {
      setNavOpen((x) => !x);
    },
    { filter: (_) => true },
  );

  return (
    <DocumentTitle title={`Tweek - ${selectedKey?.key || 'Keys'}`}>
      <div className="keys-page-container">
        <div key="KeysList" className="keys-list">
          <div className="keys-list-wrapper">
            <KeysList selectedKey={selectedKey?.key} />
          </div>
          <div className="add-button-wrapper">
            <button
              className="add-key-button"
              data-comp="add-new-key"
              onClick={() => addKey(hasUnsavedChanges)}
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

const loadingFactory = () => Promise.all([refreshTypes(), refreshSchema()]);
const KeysPageWithLoading = withLoading(loadingFactory)(KeysPage);

export default enhance(KeysPageWithLoading);

import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { compose } from 'recompose';
import DocumentTitle from 'react-document-title';
import * as keysActions from '../../../../store/ducks/keys';
import { addKey } from '../../../../store/ducks/selectedKey';
import KeysList from '../KeysList/KeysList';
import withLoading from '../../../../hoc/with-loading';
import { refreshTypes } from '../../../../services/types-service';
import { refreshSchema } from '../../../../services/context-service';
import hasUnsavedChanges from '../utils/hasUnsavedChanges';
import ErrorPage from '../../../../components/ErrorPage';
import QuickNavigation from '../QuickNavigation/QuickNavigation';
import './KeysPage.css';
import { downloadTags } from '../../../../store/ducks/tags';
import { useHotkeys } from 'react-hotkeys-hook';
import { push } from 'connected-react-router';

export default compose(
  connect((state) => state, { ...keysActions, addKey, downloadTags, push }),
  withLoading(
    () => null,
    (error) => <ErrorPage error={error} />,
    () => Promise.all([refreshTypes(), refreshSchema()]),
  ),
)(({ keys, addKey, children, selectedKey, getKeys, tags, push, downloadTags, router }) => {
  useEffect(() => {
    if (!keys || keys.length === 0) {
      getKeys();
    }
    if (!tags || tags.length === 0) {
      downloadTags();
    }
  }, []); //eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setNavOpen(false);
  }, [router.location.pathname, router.location.search]);
  const [navOpen, setNavOpen] = useState(false);
  useHotkeys(
    'ctrl+k',
    () => {
      setNavOpen((x) => !x);
    },
    { filter: (_) => true },
  );

  return (
    <DocumentTitle title={`Tweek - ${(selectedKey && selectedKey.key) || 'Keys'}`}>
      <div className="keys-page-container">
        <div key="KeysList" className="keys-list">
          <div className="keys-list-wrapper">
            <KeysList keys={keys} />
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
              keys={keys}
              push={(x) => {
                push(x);
                setNavOpen(false);
              }}
              tags={tags || []}
            />
          )}
          {children}
        </div>
      </div>
    </DocumentTitle>
  );
});

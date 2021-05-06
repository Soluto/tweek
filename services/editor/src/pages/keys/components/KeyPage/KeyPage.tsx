import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { RouteLeaveGuard } from '../../../../hoc/route-leave-hook';
import { BLANK_KEY_NAME } from '../../../../store/ducks/ducks-utils/blankKeyDefinition';
import { closeKey, openKey } from '../../../../store/ducks/selectedKey';
import { KeyActions, StoreState } from '../../../../store/ducks/types';
import { useHistorySince } from '../../../../utils';
import hasUnsavedChanges from '../utils/hasUnsavedChanges';
import KeyAddPage from './KeyAddPage/KeyAddPage';
import KeyEditPage from './KeyEditPage/KeyEditPage';
import './KeyPage.css';
import MessageKeyPage from './MessageKeyPage/MessageKeyPage';

type Actions = Pick<KeyActions, 'openKey' | 'closeKey'>;

type StateProps = Pick<StoreState, 'selectedKey'>;

const enhance = connect<StateProps, Actions, {}, StoreState>(
  (state) => ({
    selectedKey: state.selectedKey,
  }),
  { openKey, closeKey },
);

export type KeyPageProps = Actions & StateProps & RouteComponentProps;

const KeyPage = ({ selectedKey, match, location, history, openKey, closeKey }: KeyPageProps) => {
  const configKey = location.pathname.substring(
    match.path.endsWith('/') ? match.path.length : match.path.length + 1,
  );
  const params = new URLSearchParams(location.search);
  const revision = params.get('revision');

  const historySince = useHistorySince();

  useEffect(() => {
    if (configKey) {
      openKey(configKey, { revision, historySince });
    } else {
      closeKey();
    }
  }, [configKey, revision]); //eslint-disable-line react-hooks/exhaustive-deps

  if (!selectedKey || !selectedKey.isLoaded) {
    return <MessageKeyPage data-comp="loading-key" message="Loading..." />;
  }

  if (configKey === BLANK_KEY_NAME && !selectedKey?.detailsAdded) {
    return <KeyAddPage />;
  }

  const { implementation } = selectedKey.local;
  return !implementation ? (
    <MessageKeyPage data-comp="key-not-found" message="Non-existent key" />
  ) : (
    <KeyEditPage revision={revision || undefined} history={history} selectedKey={selectedKey} />
  );
};

const KeyPageWithGuard = (props: KeyPageProps) => (
  <RouteLeaveGuard
    guard={hasUnsavedChanges(props)}
    message="You have unsaved changes, are you sure you want to leave this page?"
    className="key-page-wrapper"
  >
    <KeyPage {...props} />
  </RouteLeaveGuard>
);

export default enhance(KeyPageWithGuard);

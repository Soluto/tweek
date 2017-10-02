import React from 'react';
import { connect } from 'react-redux';
import { compose, lifecycle } from 'recompose';
import * as selectedKeyActions from '../../../../store/ducks/selectedKey';
import * as alertActions from '../../../../store/ducks/alerts';
import { BLANK_KEY_NAME } from '../../../../store/ducks/ducks-utils/blankKeyDefinition';
import routeLeaveHook from '../../../../hoc/route-leave-hook';
import hasUnsavedChanges from '../utils/hasUnsavedChanges';
import MessageKeyPage from './MessageKeyPage/MessageKeyPage';
import KeyEditPage from './KeyEditPage/KeyEditPage';
import KeyAddPage from './KeyAddPage/KeyAddPage';
import './KeyPage.css';

const KeyPage = compose(
  connect(
    (state, { match, location }) => {
      const configKey = location.pathname.substring(
        match.path.endsWith('/') ? match.path.length : match.path.length + 1,
      );
      return {
        selectedKey: state.selectedKey,
        configKey,
        revision: location.query && location.query.revision,
        detailsAdded: state.selectedKey && state.selectedKey.detailsAdded,
      };
    },
    { ...selectedKeyActions, ...alertActions },
  ),
  routeLeaveHook(
    hasUnsavedChanges,
    'You have unsaved changes, are you sure you want to leave this page?',
    { className: 'key-page-wrapper' },
  ),
  lifecycle({
    componentDidMount() {
      const { configKey, selectedKey, openKey, revision } = this.props;
      if (!configKey) return;
      if (selectedKey && selectedKey.key === configKey) return;
      openKey(configKey, { revision });
    },
    componentWillReceiveProps({ configKey, revision }) {
      const { openKey } = this.props;
      if (configKey !== this.props.configKey || revision !== this.props.revision) {
        openKey(configKey, { revision });
      }
    },
    componentWillUnmount() {
      this.props.closeKey();
    },
  }),
)(({ showCustomAlert, showAlert, showConfirm, configKey, detailsAdded, ...props }) => {
  const { selectedKey } = props;
  const alerter = {
    showCustomAlert,
    showAlert,
    showConfirm,
  };
  if (!selectedKey || !selectedKey.isLoaded) {
    return <MessageKeyPage data-comp="loading-key" message="Loading..." />;
  }

  if ((configKey === BLANK_KEY_NAME) && !detailsAdded) {
    return (<KeyAddPage />);
  }

  const { implementation } = selectedKey.local;
  return !implementation
    ? <MessageKeyPage data-comp="key-not-found" message="Non-existent key" />
    : <KeyEditPage {...props} alerter={alerter} />;
});

KeyPage.displayName = 'KeyPage';

export default KeyPage;

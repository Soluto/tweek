import React from 'react';
import { connect } from 'react-redux';
import { compose, lifecycle } from 'recompose';
import R from 'ramda';
import * as selectedKeyActions from '../../../../store/ducks/selectedKey';
import * as alertActions from '../../../../store/ducks/alerts';
import { BLANK_KEY_NAME } from '../../../../store/ducks/ducks-utils/blankKeyDefinition';
import routeLeaveHook from '../../../../hoc/route-leave-hook';
import MessageKeyPage from './MessageKeyPage/MessageKeyPage';
import KeyEditPage from './KeyEditPage/KeyEditPage';
import './KeyPage.css';

const onRouteLeaveConfirmFunc = (props) => {
  if (!props.selectedKey || props.selectedKey.isSaving) return false;

  const { local, remote } = props.selectedKey;
  return !R.equals(local, remote);
};

const KeyPage = compose(
  connect(
    (state, { match, location }) => {
      const configKey = location.pathname.substring(
        match.path.endsWith('/') ? match.path.length : match.path.length + 1,
      );
      return {
        selectedKey: state.selectedKey,
        configKey,
        isInAddMode: configKey === BLANK_KEY_NAME,
        revision: location.query && location.query.revision,
      };
    },
    { ...selectedKeyActions, ...alertActions },
  ),
  routeLeaveHook(
    onRouteLeaveConfirmFunc,
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
)(({ showCustomAlert, showAlert, showConfirm, ...props }) => {
  const { selectedKey } = props;
  const alerter = {
    showCustomAlert,
    showAlert,
    showConfirm,
  };
  if (!selectedKey || !selectedKey.isLoaded) {
    return <MessageKeyPage message="Loading..." />;
  }

  const { keyDef } = selectedKey.local;
  return !keyDef
    ? <MessageKeyPage message="None existent key" />
    : <KeyEditPage {...props} alerter={alerter} />;
});

KeyPage.displayName = 'KeyPage';

export default KeyPage;

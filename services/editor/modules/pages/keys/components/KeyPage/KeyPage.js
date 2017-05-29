import React from 'react';
import { connect } from 'react-redux';
import * as selectedKeyActions from '../../../../store/ducks/selectedKey';
import * as alertActions from '../../../../store/ducks/alerts';
import { compose, lifecycle } from 'recompose';
import MessageKeyPage from './MessageKeyPage/MessageKeyPage';
import KeyEditPage from './KeyEditPage/KeyEditPage';
import { BLANK_KEY_NAME } from '../../../../store/ducks/ducks-utils/blankKeyDefinition';
import { diff } from 'deep-diff';
import routeLeaveHook from '../../../../hoc/route-leave-hook';

const onRouteLeaveConfirmFunc = (props) => {
  if (!props.selectedKey || props.selectedKey.isSaving) return;

  const { local, remote } = props.selectedKey;
  const changes = diff(local, remote);
  const hasChanges = (changes || []).length > 0;

  if (hasChanges) {
    return 'You have unsaved changes, are you sure you want to leave this page?';
  }
};

const keyPageComp = compose(
  connect(
    (state, { params, location }) => ({
      selectedKey: state.selectedKey,
      configKey: params.splat,
      isInAddMode: params.splat === BLANK_KEY_NAME,
      revision: location.query.revision,
    }),
    { ...selectedKeyActions, ...alertActions },
  ),
  routeLeaveHook(onRouteLeaveConfirmFunc),
  lifecycle({
    componentDidMount() {
      const { configKey, selectedKey, openKey, revision } = this.props;
      if (!configKey) return;
      if (selectedKey && selectedKey.key === configKey) return;
      openKey(configKey, { revision });
    },
    componentWillReceiveProps({ configKey, revision }) {
      const { openKey, selectedKey } = this.props;
      if (configKey !== this.props.configKey || revision !== this.props.revision) {
        openKey(configKey, { revision });
      }
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

export default keyPageComp;

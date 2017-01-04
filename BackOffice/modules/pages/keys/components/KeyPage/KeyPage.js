import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import * as selectedKeyActions from '../../../../store/ducks/selectedKey';
import { compose, lifecycle } from 'recompose';
import MessageKeyPage from './MessageKeyPage/MessageKeyPage';
import KeyEditPage from './KeyEditPage/KeyEditPage';
import { BLANK_KEY_NAME } from '../../../../store/ducks/ducks-utils/blankKeyDefinition';
import { diff } from 'deep-diff';
import routeLeaveHook from '../../../../hoc/route-leave-hook';

const onRouteLeaveConfirmFunc = (props) => {
  if (!props.selectedKey ||
    props.selectedKey.isSaving) return;
    
  const { local, remote } = props.selectedKey;
  const changes = diff(local, remote);
  const hasChanges = (changes || []).length > 0;

  if (hasChanges)
    return 'You have unsaved changes, are you sure you want to leave this page?'
};

const keyPageComp = compose(
  connect((state, { params }) =>
    ({ selectedKey: state.selectedKey, configKey: params.splat, isInAddMode: params.splat === BLANK_KEY_NAME }),
    { ...selectedKeyActions }),
routeLeaveHook(onRouteLeaveConfirmFunc),
  lifecycle({
    componentDidMount() {
      const { configKey, selectedKey, openKey } = this.props;
      if (!configKey) return;
      if (selectedKey && selectedKey.key === configKey) return;
      openKey(configKey);
    },
    componentWillReceiveProps({ configKey }) {
      const { openKey, selectedKey } = this.props;
      if (configKey !== this.props.configKey || !selectedKey) {
        openKey(configKey);
      }
    },
  }))
(props => {
  const { selectedKey } = props;

  if (!selectedKey ||
    !selectedKey.isLoaded)
    return <MessageKeyPage message="Loading..."></MessageKeyPage>;

  const { meta, keyDef } = selectedKey.local;
  if (!meta || !keyDef)
    return <MessageKeyPage message="Damaged key :("></MessageKeyPage>;

  return <KeyEditPage {...props} />;
});

export default keyPageComp;

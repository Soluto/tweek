import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import * as selectedKeyActions from '../../../../store/ducks/selectedKey';
import { compose, lifecycle } from 'recompose';
import MessageKeyPage from './MessageKeyPage/MessageKeyPage';
import KeyEditPage from './KeyEditPage/KeyEditPage';

const keyPageComp = compose(
  connect(
    (state, { params, route }) =>
      ({ selectedKey: state.selectedKey, configKey: route.isInAddMode ? '_blank' : params.splat, isInAddMode: route.isInAddMode }),
    { ...selectedKeyActions }),
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

import React from 'react';
import { connect } from 'react-redux';
import { compose, lifecycle } from 'recompose';
import { withTweekValues } from 'react-tweek';
import querystring from 'query-string';
import * as selectedKeyActions from '../../../../store/ducks/selectedKey';
import * as alertActions from '../../../../store/ducks/alerts';
import { BLANK_KEY_NAME, FOLDER_EDIT_NAME } from '../../../../store/ducks/ducks-utils';
import routeLeaveHook from '../../../../hoc/route-leave-hook';
import hasUnsavedChanges from '../utils/hasUnsavedChanges';
import MessageKeyPage from './MessageKeyPage/MessageKeyPage';
import KeyEditPage from './KeyEditPage/KeyEditPage';
import KeyAddPage from './KeyAddPage/KeyAddPage';
import FolderEditPage from '../FolderEditPage';
import './KeyPage.css';

const KeyPage = ({
  showCustomAlert,
  showAlert,
  showConfirm,
  configKey,
  detailsAdded,
  ...props
}) => {
  const { selectedKey } = props;
  const alerter = {
    showCustomAlert,
    showAlert,
    showConfirm,
  };
  if (!selectedKey || !selectedKey.isLoaded) {
    return <MessageKeyPage data-comp="loading-key" message="Loading..." />;
  }

  if (configKey === BLANK_KEY_NAME && !detailsAdded) {
    return <KeyAddPage />;
  }

  if (configKey.endsWith(`/${FOLDER_EDIT_NAME}`)) {
    return <FolderEditPage />;
  }

  console.log('selected', selectedKey);

  const { implementation } = selectedKey.local;
  return !implementation ? (
    <MessageKeyPage data-comp="key-not-found" message="Non-existent key" />
  ) : (
    <KeyEditPage {...props} alerter={alerter} />
  );
};

const mapStateToProps = (state, { match, location }) => {
  const configKey = location.pathname.substring(
    match.path.endsWith('/') ? match.path.length : match.path.length + 1,
  );
  const query = location.search && querystring.parse(location.search);

  return {
    selectedKey: state.selectedKey,
    configKey,
    revision: query.revision,
    detailsAdded: state.selectedKey && state.selectedKey.detailsAdded,
  };
};

const enhance = compose(
  connect(
    mapStateToProps,
    { ...selectedKeyActions, ...alertActions },
  ),
  routeLeaveHook(
    hasUnsavedChanges,
    'You have unsaved changes, are you sure you want to leave this page?',
    { className: 'key-page-wrapper' },
  ),
  withTweekValues({ historySince: '@tweek/editor/history/since' }, { defaultValues: {} }),
  lifecycle({
    componentDidMount() {
      const { configKey, selectedKey, openKey, revision, historySince } = this.props;
      if (!configKey) return;
      if (selectedKey && selectedKey.key === configKey) return;
      openKey(configKey, { revision, historySince });
    },
    componentWillReceiveProps({ configKey, revision, historySince }) {
      const { openKey } = this.props;
      if (
        configKey !== BLANK_KEY_NAME &&
        (configKey !== this.props.configKey || revision !== this.props.revision)
      ) {
        openKey(configKey, { revision, historySince });
      }
    },
    componentWillUnmount() {
      this.props.closeKey();
    },
  }),
);

KeyPage.displayName = 'KeyPage';

export default enhance(KeyPage);

import { equals } from 'ramda';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { useLoadKey } from '../../../../contexts/SelectedKey/SelectedKey';
import { createUseSelectedKey } from '../../../../contexts/SelectedKey/useSelectedKey';
import { RouteLeaveGuard } from '../../../../hoc/route-leave-hook';
import KeyEditPage from './KeyEditPage/KeyEditPage';
import './KeyPage.css';
import MessageKeyPage from './MessageKeyPage/MessageKeyPage';

const useSelectedKey = createUseSelectedKey(({ manifest }) => !!manifest);

const KeyPage = ({ match, location }: RouteComponentProps) => {
  const configKey = location.pathname.substring(
    match.path.endsWith('/') ? match.path.length : match.path.length + 1,
  );
  const params = new URLSearchParams(location.search);
  const revision = params.get('revision');

  const loading = useLoadKey(configKey, revision || undefined);
  const selectedKey = useSelectedKey();

  if (loading) {
    return <MessageKeyPage data-comp="loading-key" message="Loading..." />;
  }

  if (!selectedKey) {
    return <MessageKeyPage data-comp="key-not-found" message="Non-existent key" />;
  }

  return <KeyEditPage />;
};

const useHasChanges = createUseSelectedKey(
  ({ remote, manifest, implementation }) =>
    !equals(remote?.manifest, manifest) || !equals(remote?.implementation, implementation),
);

const KeyPageWithGuard = (props: RouteComponentProps) => {
  const hasChanges = useHasChanges();
  return (
    <RouteLeaveGuard
      guard={hasChanges}
      message="You have unsaved changes, are you sure you want to leave this page?"
      className="key-page-wrapper"
    >
      <KeyPage {...props} />
    </RouteLeaveGuard>
  );
};

export default KeyPageWithGuard;

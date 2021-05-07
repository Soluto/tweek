import React from 'react';
import { Redirect, RouteComponentProps } from 'react-router';
import {
  createUseSelectedKey,
  useLoadKey,
  useUpdateKey,
} from '../../../../../contexts/SelectedKey';
import { RouteLeaveGuard } from '../../../../../hoc/route-leave-hook';
import KeyEditPage from '../KeyEditPage/KeyEditPage';
import './KeyAddPage.css';
import KeyManifestPage from './KeyManifestPage';

const useShouldContinue = createUseSelectedKey(({ remote, manifest }) => ({
  shouldContinue: !!manifest,
  savedKeyPath: !!remote && remote.manifest.key_path,
}));

const KeyAddPage = ({ location }: RouteComponentProps) => {
  const loading = useLoadKey(undefined, location.key);

  const { shouldContinue, savedKeyPath } = useShouldContinue();
  const { createNewKey } = useUpdateKey();

  if (loading) {
    return null;
  }

  if (!shouldContinue) {
    const params = new URLSearchParams(location.search);
    return <KeyManifestPage onContinue={createNewKey} hint={params.get('hint') || ''} />;
  }

  if (savedKeyPath) {
    return <Redirect push to={`/keys/${savedKeyPath}`} />;
  }

  return (
    <RouteLeaveGuard
      guard
      message="You have unsaved changes, are you sure you want to leave this page?"
      className="key-page-wrapper"
    >
      <KeyEditPage />
    </RouteLeaveGuard>
  );
};

export default KeyAddPage;

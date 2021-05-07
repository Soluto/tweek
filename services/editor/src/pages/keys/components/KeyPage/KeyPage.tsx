import React from 'react';
import { RouteComponentProps } from 'react-router';
import { createUseSelectedKey, useLoadKey } from '../../../../contexts/SelectedKey';
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

  const loading = useLoadKey(configKey, revision || undefined, true);
  const selectedKey = useSelectedKey();

  if (loading) {
    return <MessageKeyPage data-comp="loading-key" message="Loading..." />;
  }

  if (!selectedKey) {
    return <MessageKeyPage data-comp="key-not-found" message="Non-existent key" />;
  }

  return <KeyEditPage />;
};

export default KeyPage;

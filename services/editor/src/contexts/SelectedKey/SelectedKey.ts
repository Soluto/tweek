import { createContext, useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { BehaviorSubject } from 'rxjs';
import { KeyDefinition, Revision } from 'tweek-client';
import { KeyManifest } from 'tweek-client/src/TweekManagementClient/types';
import { showError, tweekManagementClient, useHistorySince } from '../../utils';

export type SelectedKey = {
  remote?: KeyDefinition;
  manifest?: KeyManifest;
  implementation?: string;
  revision?: string;
  revisionHistory?: Revision[];
  usedBy?: string[];
  aliases?: string[];
  isSaving?: boolean;
};

export const SelectedKeyContext = createContext(new BehaviorSubject<SelectedKey>({}));

export const useSelectedKeyContext = () => useContext(SelectedKeyContext);

/* eslint-disable react-hooks/exhaustive-deps */

export const useLoadKey = (keyPath?: string, revision?: string) => {
  const [loading, setLoading] = useState(true);
  const key$ = useSelectedKeyContext();
  const history = useHistory();
  const historySince = useHistorySince();

  useEffect(() => {
    if (!keyPath || keyPath !== key$.value.manifest?.key_path) {
      key$.next({});
    }

    if (!keyPath) {
      setLoading(false);
      return;
    }

    setLoading(true);

    let cancel = false;
    const load = async () => {
      let remote: KeyDefinition;

      try {
        remote = await tweekManagementClient.getKeyDefinition(keyPath, revision);
      } catch (error) {
        return;
      }

      if (cancel) {
        return;
      }

      const { manifest, implementation } = remote;

      if (manifest.implementation.type === 'alias') {
        history.push({
          pathname: `/keys/${manifest.implementation.key}`,
          search: history.location.search,
        });
        return;
      }

      key$.next({ remote, manifest, implementation, revision });

      tweekManagementClient
        .getKeyRevisionHistory(keyPath, historySince)
        .then((revision) => {
          !cancel && key$.next({ ...key$.value, revisionHistory: revision });
        })
        .catch((err) => showError(err, 'Failed to load revision history'));

      tweekManagementClient
        .getKeyDependents(keyPath)
        .then(({ usedBy, aliases }) => {
          !cancel && key$.next({ ...key$.value, usedBy, aliases });
        })
        .catch((err) => showError(err, 'Failed to load key dependents'));
    };

    load().then(() => !cancel && setLoading(false));

    return () => {
      cancel = true;
    };
  }, [keyPath, revision]);

  return loading;
};

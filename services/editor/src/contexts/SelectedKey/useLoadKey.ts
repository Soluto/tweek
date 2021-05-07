import { equals } from 'ramda';
import { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { KeyDefinition } from 'tweek-client';
import { showError, tweekManagementClient, useHistorySince } from '../../utils';
import { LocalKeyStorage } from './localKeyStorage';
import { useSelectedKeyContext } from './SelectedKey';

export const useLoadKey = (keyPath?: string, revision?: string, sync?: boolean) => {
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

      if (revision) {
        key$.next({ remote, manifest, implementation, revision });
      } else {
        const local = LocalKeyStorage.get(keyPath);
        key$.next({
          remote,
          manifest: local?.manifest || remote.manifest,
          implementation: local?.implementation || remote.implementation,
        });
      }

      tweekManagementClient
        .getKeyRevisionHistory(keyPath, historySince)
        .then((revisionHistory) => {
          !cancel && key$.next({ ...key$.value, revisionHistory });
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
  }, [keyPath, revision, key$, history, historySince]);

  useEffect(() => {
    if (!sync) {
      return;
    }

    const subscription = key$.subscribe(({ remote, manifest, implementation, revision }) => {
      const keyPath = manifest?.key_path;
      if (!keyPath || !remote || revision) {
        return;
      }

      if (!equals(remote.manifest, manifest) || !equals(remote.implementation, implementation)) {
        LocalKeyStorage.set(keyPath, { manifest: manifest!, implementation });
      } else {
        LocalKeyStorage.remove(keyPath);
      }
    });

    return () => subscription.unsubscribe();
  }, [key$, sync]);

  return loading;
};

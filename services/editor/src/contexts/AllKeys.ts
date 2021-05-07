import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { KeyManifest } from 'tweek-client';
import { KeyDefinition } from 'tweek-client/src/TweekManagementClient/types';
import { tweekManagementClient } from '../utils';

const AllKeysContext = createContext(new BehaviorSubject<Record<string, KeyManifest>>({}));

export const useKeysContext = () => useContext(AllKeysContext);

export const useLoadKeys = () => {
  const keys$ = useKeysContext();

  useEffect(() => {
    const load = async () => {
      const manifests = await tweekManagementClient.getAllKeyManifests();
      const keys = Object.fromEntries(manifests.map((m) => [m.key_path, m]));
      keys$.next(keys);
    };

    load();
  }, [keys$]);
};

export const useAllKeys = () => {
  const keys$ = useKeysContext();
  const [keys, setKeys] = useState(keys$.value);

  useEffect(() => {
    const subscription = keys$.subscribe(setKeys);
    return () => subscription.unsubscribe();
  }, [keys$]);

  return keys;
};

export const useKeysActions = () => {
  const keys$ = useKeysContext();

  const saveKey = useCallback(
    async (definition: KeyDefinition) => {
      const keyPath = definition.manifest.key_path;
      await tweekManagementClient.saveKeyDefinition(keyPath, definition);
      keys$.next({ ...keys$.value, [keyPath]: definition.manifest });
    },
    [keys$],
  );

  const deleteKey = useCallback(
    async (keyPath: string, aliases?: string[]) => {
      await tweekManagementClient.deleteKey(keyPath, aliases);

      keys$.next(
        Object.fromEntries(
          Object.entries(keys$.value).filter(([key]) => key !== keyPath && !aliases?.includes(key)),
        ),
      );
    },
    [keys$],
  );

  return {
    saveKey,
    deleteKey,
  };
};

import { createContext, useContext, useEffect, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { KeyManifest } from 'tweek-client';
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

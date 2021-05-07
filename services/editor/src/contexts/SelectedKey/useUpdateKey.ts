import { useCallback } from 'react';
import { KeyManifest } from 'tweek-client';
import { createJPadSource } from '../../store/ducks/ducks-utils/blankKeyDefinition';
import { useSelectedKeyContext } from './SelectedKey';

export const useUpdateKey = () => {
  const key$ = useSelectedKeyContext();

  const updateKeyManifest = useCallback(
    (manifest: KeyManifest) => key$.next({ ...key$.value, manifest }),
    [key$],
  );

  const updateImplementation = useCallback(
    (implementation: string) => key$.next({ ...key$.value, implementation }),
    [key$],
  );

  const createNewKey = useCallback(
    (manifest: KeyManifest) => {
      let implementation: string | undefined;
      if (manifest.implementation.type === 'file' && manifest.implementation.format === 'jpad') {
        implementation = createJPadSource();
      }
      key$.next({ manifest, implementation });
    },
    [key$],
  );

  const resetLocalChanges = useCallback(() => {
    const { remote, manifest, implementation, ...rest } = key$.value;
    key$.next({
      remote,
      manifest: remote?.manifest,
      implementation: remote?.implementation,
      ...rest,
    });
  }, [key$]);

  return {
    updateKeyManifest,
    updateImplementation,
    createNewKey,
    resetLocalChanges,
  };
};

import { useCallback } from 'react';
import { KeyManifest } from 'tweek-client';
import { createJPadSource } from './blankKeyDefinition';
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

  return {
    updateKeyManifest,
    updateImplementation,
    createNewKey,
  };
};

import * as R from 'ramda';
import { useState, useEffect } from 'react';

export enum LoadingState {
  idle = 'idle',
  saving = 'saving',
  loading = 'loading',
  error = 'error',
}

export type RemoteState<T> = [
  T | null,
  (data: T) => void,
  {
    loadingState: LoadingState;
    isDirty: boolean;
    save: () => void;
    load: () => void;
    error?: Error;
  }
];

export function useRemoteState<T>(
  reader: () => Promise<T>,
  writer: (data: T) => Promise<void>,
): RemoteState<T> {
  const [localData, setLocalData] = useState<T | null>(null);
  const [remoteData, setRemoteData] = useState<T | null>(null);
  const [loadingState, setLoadingState] = useState(LoadingState.loading);
  const [error, setError] = useState<Error>();

  const save = async () => {
    if (loadingState == LoadingState.saving) return;
    if (localData === null) return;
    if (R.equals(localData, remoteData)) return;
    setError(undefined);
    setLoadingState(LoadingState.saving);
    try {
      await writer(localData);
      setRemoteData(localData);
    } catch (ex) {
      setError(ex);
    }
    setLoadingState(LoadingState.idle);
  };

  const load = async () => {
    setError(undefined);
    setLoadingState(LoadingState.loading);
    try {
      const data = await reader();
      setLocalData(data);
      setRemoteData(data);
      setLoadingState(LoadingState.idle);
    } catch (ex) {
      setLoadingState(LoadingState.error);
      setError(ex);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return [
    localData,
    setLocalData,
    {
      loadingState,
      isDirty: loadingState === 'idle' && !R.equals(localData, remoteData),
      save,
      load,
      error,
    },
  ];
}

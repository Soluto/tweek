import * as R from 'ramda';
import { useState, useEffect } from 'react';

/**
 *
 * @param {()=>Promise<T>} reader
 * @param {(data:T)=> Promise<void>} writer
 * @return {[ T | null, (data:T)=>void, { loadingState:'idle' | 'saving' | 'loading' | 'error', isDirty:boolean, save: ()=>void, load:()=>void, error?: Error}]}
 * @template T
 */
export function useRemoteState(reader, writer) {
  const [localData, setLocalData] = useState(null);
  const [remoteData, setRemoteData] = useState(null);
  const [loadingState, setLoadingState] = useState('idle');
  const [error, setError] = useState(undefined);

  const save = async () => {
    if (loadingState == 'saving') return;
    if (localData === null) return;
    if (R.equals(localData, remoteData)) return;
    setError(undefined);
    setLoadingState('saving');
    try {
      await writer(localData);
      setRemoteData(localData);
    } catch (ex) {
      setError(ex);
    }
    setLoadingState('idle');
  };

  const load = async () => {
    setError(undefined);
    setLoadingState('loading');
    try {
      const data = await reader();
      setLocalData(data);
      setRemoteData(data);
      setLoadingState('idle');
    } catch (ex) {
      setLoadingState('error');
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


import * as R from "ramda";
import {useState, useEffect} from 'react';

type LoadingState = "idle" | "saving" |"loading" | "error";

export function useRemoteState<T>(reader: ()=> Promise<T>, writer: (data: T) => Promise<void> )
:[T|null, (data:T)=>void, {loadingState:LoadingState, isDirty: boolean, save: ()=>void, load: ()=>void, error?: Error }] {
  const [localData,setLocalData] = useState<T|null>(null);
  const [remoteData,setRemoteData] = useState<T|null>(null);
  const [loadingState, setLoadingState ] = useState<LoadingState>("idle"); 
  const [error, setError] = useState<Error | undefined>(undefined);

  const save = async ()=>{
    if (loadingState == "saving") return;
    if (localData === null) return;
    setError(undefined);
    setLoadingState("saving");
    try{
      await writer(localData);
      setRemoteData(localData);
    }
    catch (ex){
      setLoadingState("error")
      setError(ex);
    }
    setLoadingState("idle");
  };

  const load = async ()=> {
    setError(undefined);
    setLoadingState("loading");
    try{
      const data = await reader();
      setLocalData(data);
      setRemoteData(data);
      setLoadingState("idle");
    }
    catch (ex){
      setLoadingState("error");
      setError(ex);
    }
  };

  useEffect(()=>{load()},[]);
  
  return [localData, setLocalData, { loadingState, isDirty: !R.equals(localData, remoteData), save, load, error } ];
}

import * as R from "ramda";
import {useState, useEffect, useContext} from 'react';
import { ReduxContext } from "../../../../store";
import { showError } from "../../../../store/ducks/notifications";
import { FetchError } from "tweek-client";

type LoadingState = "idle" | "saving" |"loading" | "error";

export function useErrorNotifier(error:Error | null = null, title = "An error has occurred"){
    const {dispatch} = useContext(ReduxContext);
    useEffect(()=>{
        if (!error) return; 

        const format = (error instanceof FetchError) ? ({response: {status, statusText} }:FetchError)=> `${status}: ${statusText}` : 
                                                       (x:Error) => x.message;

        dispatch(showError({title, error: error, format }))
    },[error])
}

export function useRemoteState<T>(reader: ()=> Promise<T>, writer: (data: T) => Promise<void> )
:[T|null, (data:T)=>void, {loadingState:LoadingState, isDirty: boolean, save: ()=>void, load: ()=>void, error?: Error }] {
  const [localData,setLocalData] = useState<T|null>(null);
  const [remoteData,setRemoteData] = useState<T|null>(null);
  const [loadingState, setLoadingState ] = useState<LoadingState>("idle"); 
  const [error, setError] = useState<Error | undefined>(undefined);
  
  const save = async ()=>{
    if (loadingState == "saving") return;
    if (localData === null) return;
    if (R.equals(localData, remoteData)) return;
    setError(undefined);
    setLoadingState("saving");
    try{
      await writer(localData);
      setRemoteData(localData);
    }
    catch (ex){
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
  
  
  return [localData, setLocalData, { loadingState, isDirty: loadingState === "idle" && !R.equals(localData, remoteData), save, load, error } ];
}
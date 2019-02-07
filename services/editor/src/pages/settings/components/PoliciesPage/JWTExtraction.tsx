import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { tweekManagementClient } from '../../../../utils/tweekClients';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import { useRemoteState, useErrorNotifier } from "./utils"


const monacoOptions = {
    autoIndent: true,
    automaticLayout: true,
    formatOnPaste: true,
    formatOnType: true,
    scrollBeyondLastLine: false,
    minimap: {
      enabled: false,
    },
  };

export default function(){
  const [policy, setPolicy, remote] = useRemoteState(()=> tweekManagementClient.getJWTExtractionPolicy(), 
                                            (policy)=> tweekManagementClient.updateJWTExtractionPolicy(policy) );
  useErrorNotifier( remote.loadingState === "idle" ? remote.error : null, "Error saving jwt-policy")
  
  if (remote.error && remote.loadingState === "error"){
    return <div>Error: {remote.error.message}</div>
  }
  if (remote.loadingState === "loading" && !policy) return null;
  

  return <>
    <SaveButton isValid={true} isSaving={remote.loadingState === "saving"} hasChanges={remote.isDirty} onClick={()=>remote.save()} />
    <MonacoEditor
          language="rego"
          options={monacoOptions}
          value={policy}
          onChange={(newSource:string) => {
            setPolicy(newSource)
          }} />
    </>
         
}
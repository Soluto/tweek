import React from 'react';
import MonacoEditor from 'react-monaco-editor';
import { tweekManagementClient } from '../../../../utils/tweekClients';
import SaveButton from '../../../../components/common/SaveButton/SaveButton';
import { useRemoteState } from "./utils"


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
  const [policies, setPolicies, remote] = useRemoteState(()=> tweekManagementClient.getJWTExtractionPolicy(), 
                                            (policy)=> tweekManagementClient.updateJWTExtractionPolicy(policy) );
  if (remote.error && !policies){
    return <div>Error: {remote.error.message}</div>
  }
  if (remote.loadingState === "loading" && !policies) return null;

  return <>
    <SaveButton isValid={true} isSaving={remote.loadingState === "saving"} hasChanges={remote.isDirty} onClick={()=>remote.save()} />
    <MonacoEditor
          language="rego"
          options={monacoOptions}
          value={policies}
          onChange={(newSource:string) => {
            setPolicies(newSource)
          }} />
    </>
         
}
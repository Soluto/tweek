import React from 'react';
import { KeyManifest } from 'tweek-client';
import ConstEditor from '../../../../../components/ConstEditor';
import JPadFullEditor from '../../../../../components/JPadFullEditor/JPadFullEditor';
import { useUpdateKey } from '../../../../../contexts/SelectedKey/useUpdateKey';
import { types } from '../../../../../services/types-service';

export type EditorProps = {
  manifest: KeyManifest;
  sourceFile: string;
  onDependencyChanged: (deps: string[]) => void;
  isReadonly?: boolean;
};

const KeyEditor = ({ manifest, sourceFile, onDependencyChanged, isReadonly }: EditorProps) => {
  const valueType = types[manifest.valueType] || types['string'];
  const { updateKeyManifest, updateImplementation } = useUpdateKey();

  if (manifest.implementation.type === 'file') {
    switch (manifest.implementation.format) {
      case 'jpad':
        return (
          <JPadFullEditor
            source={sourceFile}
            onChange={updateImplementation}
            dependencies={manifest.dependencies}
            onDependencyChanged={onDependencyChanged}
            isReadonly={isReadonly}
            valueType={valueType}
          />
        );
      default:
        return null;
    }
  }

  if (manifest.implementation.type === 'const') {
    return (
      <ConstEditor
        value={manifest.implementation.value}
        valueType={valueType}
        onChange={(value) =>
          updateKeyManifest({ ...manifest, implementation: { ...manifest.implementation, value } })
        }
      />
    );
  }
  return null;
};

export default KeyEditor;

import React from 'react';
import { KeyManifest } from 'tweek-client';
import ConstEditor from '../../../../../components/ConstEditor';
import JPadFullEditor from '../../../../../components/JPadFullEditor/JPadFullEditor';
import { types } from '../../../../../services/types-service';

export type EditorProps = {
  manifest: KeyManifest;
  sourceFile: string;
  onSourceFileChange: (source: string) => void;
  onManifestChange: (manifest: KeyManifest) => void;
  onDependencyChanged: (deps: string[]) => void;
  isReadonly?: boolean;
};

const KeyEditor = ({
  manifest,
  sourceFile,
  onManifestChange,
  onSourceFileChange,
  onDependencyChanged,
  isReadonly,
}: EditorProps) => {
  const valueType = types[manifest.valueType] || types['string'];

  if (manifest.implementation.type === 'file') {
    switch (manifest.implementation.format) {
      case 'jpad':
        return (
          <JPadFullEditor
            source={sourceFile}
            onChange={onSourceFileChange}
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
          onManifestChange({ ...manifest, implementation: { ...manifest.implementation, value } })
        }
      />
    );
  }
  return null;
};

export default KeyEditor;

import { KeyImplementation, KeyManifest } from 'tweek-client';
import { Rule } from '../../components/JPadFullEditor/types';

export const BLANK_KEY_NAME = '_blank';

export const createBlankKeyManifest = (
  keyName = '',
  implementation: KeyImplementation = { type: 'file', format: 'jpad' },
): KeyManifest => {
  const manifest = {
    key_path: keyName,
    meta: {
      archived: false,
    },
    implementation,
  } as KeyManifest;

  if (implementation.type !== 'alias') {
    manifest.valueType = 'string';
    manifest.dependencies = [];
    manifest.meta = {
      ...manifest.meta,
      name: keyName,
      description: '',
      tags: [],
    };
  }

  return manifest;
};

export const createJPadSource = (valueType = '', rules: Rule[] = [], partitions: string[] = []) =>
  JSON.stringify(
    {
      valueType,
      rules,
      partitions,
    },
    null,
    4,
  );

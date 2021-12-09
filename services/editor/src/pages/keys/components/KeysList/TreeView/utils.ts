import { KeyManifest } from 'tweek-client';

export const getDataValueType = (item: KeyManifest) => {
  if (item.meta.archived) {
    return 'archived';
  } else if (item.implementation.type === 'alias') {
    return 'alias';
  }
  return item.valueType || 'key';
};

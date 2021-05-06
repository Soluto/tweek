import { Tag } from 'react-tag-input';
import { KeyImplementation, KeyManifest, Revision } from 'tweek-client';

export type KeyData = {
  manifest: KeyManifest;
  implementation: KeyImplementation;
};

export type SelectedKey = {
  local: KeyData;
  remote: KeyData;
  revisionHistory?: Revision[];
  key: string;
  isLoaded: boolean;
  isSaving?: boolean;
  validation: {
    isValid: boolean;
    key?: Validation;
    manifest?: {
      valueType?: Validation;
    };
  };
  detailsAdded: boolean;
  usedBy?: string[];
  aliases?: string[];
};

export type Validation = {
  isValid: boolean;
  hint?: string;
  isShowingHint?: boolean;
};

export type StoreState = {
  selectedKey?: SelectedKey;
  tags: Record<string, string>;
  keys: Record<string, KeyManifest>;
};

export type KeyActions = {
  addKeyDetails: () => void;
  updateKeyPath: (keyName: string, validation: Validation) => void;
  changeKeyFormat: (f: KeyImplementation) => void;
  changeKeyValueType: (valueType: string | undefined) => void;
  saveKey: (historySince: string) => void;
  addAlias: (alias: string) => void;
  archiveKey: (archived: boolean, historySince: string) => void;
  deleteKey: () => void;
  updateKeyManifest: (manifest: KeyManifest) => void;
  deleteAlias: (dep: string) => void;
  updateKeyName: (text: string) => void;
  updateImplementation: (implementation: Partial<KeyImplementation>) => void;
  addKey: (guard: (s: StoreState) => boolean, key: string) => void;
  openKey: (key: string, config: { revision?: string | null; historySince: string }) => void;
  closeKey: () => void;
};

export type TagActions = {
  saveNewTag: (tag: Tag) => void;
};

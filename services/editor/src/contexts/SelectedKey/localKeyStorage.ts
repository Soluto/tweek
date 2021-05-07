import { KeyDefinition } from 'tweek-client';

const getStorageKey = (keyPath: string) => `@tweek:local-key:${keyPath}`;

export const LocalKeyStorage = {
  set: (keyPath: string, key: KeyDefinition) => {
    localStorage.setItem(getStorageKey(keyPath), JSON.stringify(key));
  },
  get: (keyPath: string) => {
    const stored = localStorage.getItem(getStorageKey(keyPath));
    try {
      return JSON.parse(stored!) as KeyDefinition;
    } catch {
      return undefined;
    }
  },
  remove: (keyPath: string) => {
    localStorage.removeItem(getStorageKey(keyPath));
  },
};

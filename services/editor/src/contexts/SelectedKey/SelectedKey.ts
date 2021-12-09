import { createContext, useContext } from 'react';
import { BehaviorSubject } from 'rxjs';
import { KeyDefinition, Revision } from 'tweek-client';
import { KeyManifest } from 'tweek-client/src/TweekManagementClient/types';

export type SelectedKey = {
  remote?: KeyDefinition;
  manifest?: KeyManifest;
  implementation?: string;
  revision?: string;
  revisionHistory?: Revision[];
  usedBy?: string[];
  aliases?: string[];
  isSaving?: boolean;
};

export const SelectedKeyContext = createContext(new BehaviorSubject<SelectedKey>({}));

export const useSelectedKeyContext = () => useContext(SelectedKeyContext);

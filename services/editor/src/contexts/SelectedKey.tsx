import { createContext, FunctionComponent, PropsWithChildren, useContext } from 'react';
import { connect } from 'react-redux';
import { KeyActions, SelectedKey, StoreState } from '../store/ducks/types';
import * as selectedKeyActions from '../store/ducks/selectedKey';

const notImplemented = () => {
  throw new Error('not implemented');
};

const SelectedKeyContext = createContext<SelectedKey | undefined>(undefined);

const SelectedKeyActionsContext = createContext<KeyActions>({
  addKeyDetails: notImplemented,
  updateKeyPath: notImplemented,
  changeKeyFormat: notImplemented,
  changeKeyValueType: notImplemented,
  saveKey: notImplemented,
  addAlias: notImplemented,
  archiveKey: notImplemented,
  deleteKey: notImplemented,
  updateKeyManifest: notImplemented,
  deleteAlias: notImplemented,
  updateKeyName: notImplemented,
  updateImplementation: notImplemented,
  addKey: notImplemented,
  openKey: notImplemented,
  closeKey: notImplemented,
});

const Provider: FunctionComponent<KeyActions & StoreState> = ({
  children,
  selectedKey,
  ...actions
}) => (
  <SelectedKeyActionsContext.Provider value={actions}>
    <SelectedKeyContext.Provider value={selectedKey}>{children}</SelectedKeyContext.Provider>
  </SelectedKeyActionsContext.Provider>
);

const enhance = connect<StoreState, KeyActions, PropsWithChildren<{}>, StoreState>(
  (s) => ({ selectedKey: s.selectedKey }),
  selectedKeyActions,
);

export const SelectedKeyProvider = enhance(Provider);

export const useSelectedKetActions = () => useContext(SelectedKeyActionsContext);

export const useSelectedKey = () => useContext(SelectedKeyContext);

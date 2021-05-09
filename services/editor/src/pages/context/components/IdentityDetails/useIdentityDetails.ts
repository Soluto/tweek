import cogoToast from 'cogo-toast';
import { equals } from 'ramda';
import { useEffect, useState } from 'react';
import { IdentityContext } from 'tweek-client/src/types';
import { showError, tweekManagementClient } from '../../../../utils';

export type IdentityDetails = {
  remote?: IdentityContext;
  local?: IdentityContext;
  isLoading: boolean;
  isSaving?: boolean;
};

export const useIdentityDetails = (identityType: string, identityId: string) => {
  const [state, setState] = useState<IdentityDetails>({ isLoading: false });

  useEffect(() => {
    setState({ isLoading: true });

    let cancel = false;

    const load = async () => {
      try {
        const contextData = await tweekManagementClient.getContext(identityType, identityId);
        !cancel && setState({ isLoading: false, remote: contextData, local: contextData });
      } catch (error) {
        !cancel && setState({ isLoading: false });
        showError(error, 'Failed to retrieve context');
      }
    };

    load();

    return () => {
      cancel = true;
    };
  }, [identityType, identityId]);

  return {
    ...state,
    update: (context: IdentityContext) => setState((s) => s && { ...s, local: context }),
    save: async () => {
      const { isSaving, remote = {}, local } = state;
      if (isSaving || !local) {
        return;
      }

      const { hide } = cogoToast.loading('Saving context...', { hideAfter: 0 });
      setState((s) => ({ ...s, isSaving: true }));

      const keysToDelete = Object.keys(remote).filter((k) => !(k in local));
      const modifiedKeys = Object.entries(local).filter(([k, v]) => !equals(remote[k], v));

      try {
        if (modifiedKeys.length > 0) {
          await tweekManagementClient.appendContext(
            identityType,
            identityId,
            Object.fromEntries(modifiedKeys),
          );
        }

        await Promise.all(
          keysToDelete.map((key) =>
            tweekManagementClient.deleteContextProperty(identityType, identityId, key),
          ),
        );

        setState((s) => ({ ...s, remote: local, isSaving: false }));
        cogoToast.success('Context saved successfully');
      } catch (error) {
        showError(error, 'Failed to update context');
        setState((s) => ({ ...s, isSaving: false }));
      } finally {
        hide!();
      }
    },
  };
};

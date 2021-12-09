import cogoToast from 'cogo-toast';
import jsonpatch from 'fast-json-patch';
import { dissoc, equals } from 'ramda';
import { createContext, useContext, useState } from 'react';
import { useHistory } from 'react-router';
import { BehaviorSubject } from 'rxjs';
import { Schema, SchemaProperty } from 'tweek-client';
import { showError, tweekManagementClient } from '../../utils';
import { useObservableState } from '../utils';
import { useSchemasContext } from './Schemas';

export const LocalSchemasContext = createContext(new BehaviorSubject<Record<string, Schema>>({}));

export const useLocalSchemasContext = () => useContext(LocalSchemasContext);

export const useLocalSchema = (identityType: string) => {
  const history = useHistory();

  const remote$ = useSchemasContext();
  const local$ = useLocalSchemasContext();

  const remote: Schema | undefined = useObservableState(remote$, (s) => s[identityType], [
    identityType,
  ]);
  const local: Schema =
    useObservableState(local$, (s) => s[identityType], [identityType]) || remote || {};
  const [isSaving, setIsSaving] = useState(false);

  const saveIdentity = async () => {
    if (isSaving || !local) {
      return;
    }
    setIsSaving(true);

    const { hide } = cogoToast.loading('Saving identity...', { hideAfter: 0 });
    try {
      if (!remote) {
        await tweekManagementClient.saveIdentity(identityType, local);
      } else {
        const patch = jsonpatch.compare(remote, local);
        await tweekManagementClient.patchIdentity(identityType, patch);
      }
    } catch (err) {
      showError(err, `Failed to save changes for ${identityType}`);
      return;
    } finally {
      hide!();
      setIsSaving(false);
    }

    local$.next(dissoc(identityType, local$.value));
    remote$.next({ ...remote$.value, [identityType]: local });
    cogoToast.success('Identity saved successfully');
  };

  const deleteIdentity = async () => {
    if (isSaving) {
      return;
    }

    history.push(`/settings`);
    const { hide } = cogoToast.loading('Deleting identity...', { hideAfter: 0 });

    try {
      await tweekManagementClient.deleteIdentity(identityType);
    } catch (err) {
      showError(err, `Failed to delete identity ${identityType}`);
    } finally {
      hide!();
    }

    local$.next(dissoc(identityType, local$.value));
    remote$.next(dissoc(identityType, remote$.value));
    cogoToast.success('Identity deleted successfully');
  };

  const update = (local: Schema) => {
    if (isSaving) {
      return;
    }

    if (equals(remote, local)) {
      local$.next(dissoc(identityType, local$.value));
    } else {
      local$.next({ ...local$.value, [identityType]: local });
    }
  };

  const removeProperty = (property: string) => update(dissoc(property, local));

  const setProperty = (property: string, value: SchemaProperty) =>
    update({ ...local, [property]: value });

  return { remote, local, isSaving, saveIdentity, deleteIdentity, removeProperty, setProperty };
};

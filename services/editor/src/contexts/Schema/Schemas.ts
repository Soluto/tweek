import { equals } from 'ramda';
import { createContext, useContext, useEffect, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { Schema } from 'tweek-client';
import { showError, tweekManagementClient } from '../../utils';
import { getPropertyTypeDetails, getSchemaProperties } from './utils';

export const SchemasContext = createContext(new BehaviorSubject<Record<string, Schema>>({}));

export const useSchemasContext = () => useContext(SchemasContext);

export const useRefreshSchemas = () => {
  const schemas$ = useSchemasContext();
  useEffect(() => {
    tweekManagementClient
      .getAllSchemas()
      .then((schemas) => schemas$.next(schemas))
      .catch((err) => showError(err, 'Failed to load schemas'));
  }, [schemas$]);
};

export const useSchemas = () => {
  const schemas$ = useSchemasContext();
  const [state, setState] = useState(schemas$.value);

  useEffect(() => {
    const subscription = schemas$.subscribe(setState);

    return () => subscription.unsubscribe();
  }, [schemas$]);

  return state;
};

export const createUseSchemas = <Params extends any[], T>(
  mapper: (schemas: Record<string, Schema>, ...args: Params) => T,
) => (...args: Params) => {
  const schemas$ = useSchemasContext();
  const [state, setState] = useState(mapper(schemas$.value, ...args));

  useEffect(() => {
    const subscription = schemas$
      .pipe(
        map((s) => mapper(s, ...args)),
        distinctUntilChanged<T>(equals),
      )
      .subscribe(setState);

    return () => subscription.unsubscribe();
  }, [schemas$, ...args]); //eslint-disable-line react-hooks/exhaustive-deps

  return state;
};

export const useIdentitySchema = createUseSchemas((s, identityType: string) => s[identityType]);

export const useIdentities = createUseSchemas(Object.keys);

export const useSchemaProperties = createUseSchemas(getSchemaProperties);

export const usePropertyTypeDetails = createUseSchemas((s, property: string) =>
  getPropertyTypeDetails(property, s),
);

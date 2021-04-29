import React, { ComponentType, createContext, useContext } from 'react';
import { isAllowedValue, safeConvertValue, types } from '../services/types-service';

export type ValueType = {
  name: string;
  base?: string;
  allowedValues?: any[];
  comparer?: string;
  emptyValue?: any;
  ofType?: string;
};

export type TypesService = {
  types: Record<string, ValueType>;
  safeConvertValue: (value: string, targetType: ValueType) => unknown;
  isAllowedValue: (valueType: ValueType | undefined, value: any) => boolean;
};

export const TypesServiceContext = createContext<TypesService>({
  safeConvertValue,
  types,
  isAllowedValue,
});

export const useTypesService = () => useContext(TypesServiceContext);

export const getTypesService = <T extends TypesService>(Component: ComponentType<T>) => (
  props: Omit<T, keyof TypesService>,
) => {
  const typesService = useTypesService();
  // @ts-ignore
  return <Component {...props} {...typesService} />;
};

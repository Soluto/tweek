import { createContext, useContext } from 'react';
import { isAllowedValue, safeConvertValue, types } from '../services/types-service';

export const TypesServiceContext = createContext({
  safeConvertValue,
  types,
  isAllowedValue,
});

export const useTypesService = () => useContext(TypesServiceContext);

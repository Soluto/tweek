import { useEffect, useState } from 'react';
import { ValueType } from 'tweek-client';
import * as ContextService from '../services/context-service';
import * as TypesService from '../services/types-service';

export const usePropertyTypeDetails = (property: string) => {
  const [details, setDetails] = useState<ValueType>({ name: 'empty' });

  useEffect(() => {
    if (property.startsWith(ContextService.KEYS_IDENTITY)) {
      let cancel = false;

      TypesService.getValueTypeDefinition(
        property.substring(ContextService.KEYS_IDENTITY.length),
      ).then((details) => !cancel && setDetails(details));

      return () => {
        cancel = true;
      };
    }

    setDetails(ContextService.getPropertyTypeDetails(property));
  }, [property]);

  return details;
};

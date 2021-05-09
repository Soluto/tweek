import { useEffect, useState } from 'react';
import { ValueType } from 'tweek-client';
import { useSchemas } from '../../../../../contexts/Schema/Schemas';
import { getPropertyTypeDetails, KEYS_IDENTITY } from '../../../../../contexts/Schema/utils';
import * as TypesService from '../../../../../services/types-service';

export const usePropertyTypeDetails = (property: string) => {
  const [details, setDetails] = useState<ValueType>({ name: 'empty' });
  const schemas = useSchemas();

  useEffect(() => {
    if (property.startsWith(KEYS_IDENTITY)) {
      let cancel = false;

      TypesService.getValueTypeDefinition(property.substring(KEYS_IDENTITY.length)).then(
        (details) => !cancel && setDetails(details),
      );

      return () => {
        cancel = true;
      };
    }
  }, [property]);

  useEffect(() => {
    if (!property.startsWith(KEYS_IDENTITY)) {
      setDetails(getPropertyTypeDetails(property, schemas));
    }
  }, [property, schemas]);

  return details;
};

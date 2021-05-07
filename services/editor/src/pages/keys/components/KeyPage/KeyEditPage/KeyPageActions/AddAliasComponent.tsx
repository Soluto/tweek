import React from 'react';
import { AlertComponentProps } from '../../../../../../components/alerts/types';
import { useKeyPathValidation, Validation } from '../../KeyAddPage/key-name-validations';
import NewKeyInput from '../../KeyAddPage/NewKeyInput';

export type AliasData = {
  keyPath?: string;
  validation?: Validation;
};

export const AddAliasComponent = ({
  onChange,
  componentData: { keyPath = '', validation } = {},
}: AlertComponentProps<AliasData>) => {
  const validateKeyPath = useKeyPathValidation();

  return (
    <NewKeyInput
      onChange={(keyPath) => onChange({ keyPath, validation: validateKeyPath(keyPath) })}
      keyPath={keyPath}
      validation={validation}
    />
  );
};

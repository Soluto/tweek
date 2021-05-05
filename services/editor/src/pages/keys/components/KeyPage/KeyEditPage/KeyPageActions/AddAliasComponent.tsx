import React from 'react';
import { AlertComponentProps } from '../../../../../../components/alerts/types';
import { Validation } from '../../../../../../store/ducks/types';
import NewKeyInput from '../../KeyAddPage/NewKeyInput';

export type AliasData = {
  displayName?: string;
  validation?: Partial<Validation>;
};

export const AddAliasComponent = ({
  onChange,
  componentData: { displayName = '', validation = {} } = {},
}: AlertComponentProps<AliasData>) => (
  <NewKeyInput
    onChange={(newName, newValidation) =>
      onChange({ displayName: newName, validation: newValidation })
    }
    displayName={displayName}
    validation={validation}
  />
);

import React from 'react';
import { titleCase } from 'title-case';
import { ComboBox, ValidationIcon } from '../../../../../../components/common';
import * as TypesServices from '../../../../../../services/types-service';
import './KeyValueTypeSelector.css';
import { Validation } from '../../../../../../store/ducks/types';

const getValueTypeSuggestions = () =>
  Object.keys(TypesServices.types).map((x) => ({
    label: titleCase(x),
    value: x,
  }));

export type KeyValueTypeSelectorProps = {
  value: string;
  onChange: (valueType: string) => void;
  validation?: Partial<Validation>;
};

const KeyValueTypeSelector = ({
  value,
  validation: { isShowingHint = false, hint } = {},
  onChange,
}: KeyValueTypeSelectorProps) => {
  const suggestions = getValueTypeSuggestions();

  return (
    <div className="key-value-type-selector-container">
      <label className="key-value-type-label">Key value type:</label>
      <div className="key-value-type-selector-wrapper" data-with-error={isShowingHint}>
        <ValidationIcon show={isShowingHint} hint={hint} />
        <ComboBox
          data-comp="key-value-type-selector"
          suggestions={suggestions}
          placeholder="Select type"
          onChange={(_, item) => item && onChange(item.value)}
          value={titleCase(value)}
        />
      </div>
    </div>
  );
};

export default KeyValueTypeSelector;

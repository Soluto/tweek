import React from 'react';
import { connect } from 'react-redux';
import { titleCase } from 'title-case';
import { ComboBox, ValidationIcon } from '../../../../../../components/common';
import * as TypesServices from '../../../../../../services/types-service';
import { changeKeyValueType } from '../../../../../../store/ducks/selectedKey';
import './KeyValueTypeSelector.css';

const getValueTypeSuggestions = () =>
  Object.keys(TypesServices.types).map((x) => ({
    label: titleCase(x),
    value: x,
  }));

const enhance = connect(
  (state) => ({
    validation: state.selectedKey.validation.manifest.valueType,
  }),
  { changeKeyValueType },
);

const KeyValueTypeSelector = ({
  value,
  validation: { isShowingHint = false, hint },
  changeKeyValueType: onChange,
}) => {
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

export default enhance(KeyValueTypeSelector);

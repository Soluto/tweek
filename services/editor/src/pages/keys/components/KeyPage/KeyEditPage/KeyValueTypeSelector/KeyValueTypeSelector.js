import React from 'react';
import { compose } from 'recompose';
import { connect } from 'react-redux';
import changeCase from 'change-case';
import ComboBox from '../../../../../../components/common/ComboBox/ComboBox';
import ValidationIcon from '../../../../../../components/common/ValidationIcon';
import * as TypesServices from '../../../../../../services/types-service';
import { changeKeyValueType } from '../../../../../../store/ducks/selectedKey';
import './KeyValueTypeSelector.css';

const getValueTypeSuggestions = () =>
  Object.keys(TypesServices.types).map(x => ({
    label: changeCase.titleCase(x),
    value: x,
  }));

const KeyValueTypeSelector = compose(
  connect(
    state => ({
      selectedKey: state.selectedKey,
      validation: state.selectedKey.validation.manifest.valueType,
    }),
    { changeKeyValueType },
  ),
)(({ value, validation: { isShowingHint, hint }, changeKeyValueType: onChange }) => {
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
          value={changeCase.titleCase(value)}
        />
      </div>
    </div>
  );
});

export default KeyValueTypeSelector;

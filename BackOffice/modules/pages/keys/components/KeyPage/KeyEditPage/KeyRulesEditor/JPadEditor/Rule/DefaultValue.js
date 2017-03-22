import React from 'react';
import * as TypesService from '../../../../../../../../services/types-service';
import ComboBox from '../../../../../../../../components/common/ComboBox/ComboBox';
import style from './DefaultValue.css';

const booleanSingleVariantSuggestions = [{label: 'true', value: true}, {label: 'false', value: false}];
const SingleVariantValue = ({value, valueType, onChange}) => {
  if (valueType === TypesService.types.boolean.name) {
    return (
      <ComboBox
        options={booleanSingleVariantSuggestions}
        selected={booleanSingleVariantSuggestions.filter(x => x.value === value)}
        placeholder="Enter value here"
        showValueInOptions={false}
        clearButton
        onChange={e => onChange(e && e.value)}
      />
    )
  }
  return (
    <input
      onChange={e => onChange(e.target.value)}
      value={value}
      placeholder="Enter value here"
      className={style['values-input']}
    />
  )
};

function updateValue(mutate, value, valueType) {
  const typedValue = value && TypesService.safeConvertValue(value, valueType);
  if (typedValue === undefined || typedValue === '') {
    mutate.delete();
  } else {
    mutate.updateValue(typedValue);
  }
}

const DefaultValue = ({value, valueType, mutate}) => {
  return (
    <div className={style['default-value-container']}>
      <label className={style['default-value-label']}>Default Value:</label>
      <SingleVariantValue
        {...{value, valueType}}
        onChange={newValue => updateValue(mutate, newValue, valueType)}
      />
    </div>
  );
};

export default DefaultValue;

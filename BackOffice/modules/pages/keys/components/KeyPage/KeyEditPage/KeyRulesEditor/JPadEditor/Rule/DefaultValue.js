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
        onChange={e => onChange(e.value)}
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

const DefaultValue = ({value, valueType, mutate}) => {
  return (
    <div className={style['default-rule-container']}>
      <h3 className={style['rule-partial-title']}>Default Value</h3>
      <SingleVariantValue
        {...{value, valueType}}
        onChange={newValue => mutate.updateValue(TypesService.safeConvertValue(newValue, valueType))}
      />
      {
        value === undefined ? null :
          <button
            className={style['clear-default-value-button']}
            onClick={mutate.delete}
            title="Clear default value"
          />
      }
    </div>
  );
};

export default DefaultValue;

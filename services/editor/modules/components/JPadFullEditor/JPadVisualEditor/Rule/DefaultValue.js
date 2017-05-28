import React from 'react';
import * as TypesService from '../../../../services/types-service';
import ComboBox from '../../../../components/common/ComboBox/ComboBox';
import style from './DefaultValue.css';

const booleanSingleVariantSuggestions = [{ label: 'true', value: true }, { label: 'false', value: false }];
const DefaultValueInput = ({ value = '', valueType, onChange }) => {
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
    );
  }
  return (
    <input
      onChange={e => onChange(e.target.value)}
      value={value}
      placeholder="Enter value here"
      className={style['values-input']}
    />
  );
};

const DefaultValue = (props) => (
    <div className={style['default-value-container']}>
      <label className={style['default-value-label']}>Default Value:</label>
      <DefaultValueInput {...props}/>
    </div>
  );

export default DefaultValue;

import React from 'react';
import ClosedComboBox from '../../../../../../components/common/ClosedComboBox';
import style from './styles.css';

export default ({ onUpdate, meta, value }) => {
  return (
    <div className={style['property-value-wrapper']}>
      {meta.allowedValues
        ?
        <ClosedComboBox
          inputProps={{ onChange: ({ value }) => onUpdate(value), value }}
          suggestions={meta.allowedValues}
        />
        :
        <input className={style['value-input']} type="text" onChange={(e) => onUpdate(e.target.value) } value={value} />
      }
    </div>
  );
};

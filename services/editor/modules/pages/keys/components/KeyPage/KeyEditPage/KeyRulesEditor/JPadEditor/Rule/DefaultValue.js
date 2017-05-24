import React from 'react';
import TypedInput from '../../../../../../../../components/common/Input/TypedInput';
import style from './DefaultValue.css';

const DefaultValue = (props) => {
  return (
    <div className={style['default-value-container']}>
      <label className={style['default-value-label']}>Default Value:</label>
      <TypedInput {...props} />
    </div>
  );
};

export default DefaultValue;

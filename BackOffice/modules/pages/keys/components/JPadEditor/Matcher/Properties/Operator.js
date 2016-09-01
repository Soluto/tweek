import R from 'ramda';
import React from 'react';
import style from './styles.css';
import ComboBox from '../../../../../../components/common/ComboBox/ComboBox';

let equalityOps = { '$eq': '=', '$ne': '!=' };
let comparisonOps = { '$ge': '>=', '$gt': '>', '$lt': '<', '$le': '<=', ...equalityOps };
let groupOps = { '$in': 'in' };

export const getSupportedOperators = (meta) => {
  let ops = (meta.type.bool && meta.allowedValues) ? equalityOps : comparisonOps;
  if (meta.multipleValues) ops = { ...ops, ...groupOps };
  return ops;
};

export const Operator = ({ selectedOp, onUpdate, supportedOperators }) => {
  return (
    <ComboBox
      options={ R.keys(supportedOperators).map(op => ({ value: op, label: supportedOperators[op] })) }
      wrapperThemeClass={style['matcher-operator']}
      onChange={(selectedValues) => {
        onUpdate(selectedValues.value);
      } }
      selected={[
        {
          label: supportedOperators[selectedOp],
          value: selectedOp,
        },
      ]}
    />
  );
};

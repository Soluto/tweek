import R from 'ramda';
import React from 'react';
import style from './styles.css';
import ComboBox from '../../../../../../../../../components/common/ComboBox/ComboBox';

const equalityOps = { '$eq': '=', '$ne': '!=' };
const comparisonOps = { '$ge': '>=', '$gt': '>', '$lt': '<', '$le': '<=' };
const groupOps = { '$in': 'in' };
const allOps = { ...equalityOps, ...comparisonOps, ...groupOps };

export const getSupportedOperators = (meta) => {
  let type = meta.type == "custom" ? meta.custom_type.base : meta.type;
  if (type === 'empty') return allOps;

  let ops = {};
  if (type === 'boolean' || type === 'string') ops = equalityOps;
  if (type === 'number' || type === 'version') ops = { ...ops, ...comparisonOps };

  ops = { ...ops, ...groupOps };

  return ops;
};

export const Operator = ({ selectedOp, onUpdate, supportedOperators }) => {
  return (
    <ComboBox
      options={ R.keys(supportedOperators).map(op => ({ value: op, label: supportedOperators[op] })) }
      wrapperThemeClass={style['matcher-operator']}
      onChange={(selected) => {
        if (selected.value === '') return;
        onUpdate(selected.value);
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

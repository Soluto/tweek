import R from 'ramda';
import React from 'react';
import style from './styles.css';
import ComboBox from '../../../../../../components/common/ComboBox/ComboBox';
import { types } from '../../../../../../services/MetaHelpers';

const equalityOps = { '$eq': '=', '$ne': '!=' };
const comparisonOps = { '$ge': '>=', '$gt': '>', '$lt': '<', '$le': '<=' };
const groupOps = { '$in': 'in' };
const allOps = { ...equalityOps, ...comparisonOps, ...groupOps };

export const getSupportedOperators = (meta) => {
  if (meta.type === types.Empty.type) return allOps;

  let ops = {};
  if (meta.type === types.Bool.type || meta.type === types.String.type) ops = equalityOps;
  if (meta.type === types.Number.type || meta.typeAlias === 'version') ops = { ...ops, ...comparisonOps };
  if (meta.multipleValues) ops = { ...ops, ...groupOps };

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

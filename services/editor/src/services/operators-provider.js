const _createOperator = (label, operatorValue) => {
  let getValue;
  switch (operatorValue) {
  case '$eq':
    getValue = propertyValue => propertyValue;
    break;
  case '$in':
    getValue = (propertyValue, propertyTypeDetails) =>
        _toArrayValue(operatorValue, propertyValue, propertyTypeDetails);
    break;
  default:
    getValue = (propertyValue, propertyTypeDetails) =>
        _toComplexValue(operatorValue, propertyValue, propertyTypeDetails);
  }

  return {
    label,
    operatorValue,
    getValue,
  };
};

const _toArrayValue = (operatorValue, propertyValue, propertyTypeDetails) => {
  if (!propertyValue) {
    return _toComplexValue(operatorValue, [], propertyTypeDetails);
  }
  if (Array.isArray(propertyValue)) {
    return _toComplexValue(operatorValue, propertyValue, propertyTypeDetails);
  }
  return _toComplexValue(operatorValue, [propertyValue], propertyTypeDetails);
};

const _toComplexValue = (operatorValue, propertyValue, propertyTypeDetails) => ({
  [operatorValue]: propertyValue,
  ...propertyTypeDetails,
});

export const equal = _createOperator('=', '$eq');
export const notEqual = _createOperator('!=', '$ne');
export const greaterEqualThan = _createOperator('>=', '$ge');
export const greater = _createOperator('>', '$gt');
export const lessThan = _createOperator('<', '$lt');
export const lessEqualThan = _createOperator('<=', '$le');
export const inOp = _createOperator('in', '$in');
export const within = _createOperator('within', '$withinTime');
export const startsWith = _createOperator('starts with', '$startsWith');
export const endsWith = _createOperator('ends with', '$endsWith');
export const contains = _createOperator('contains', '$contains');

export const allOperators = [
  equal,
  notEqual,
  greaterEqualThan,
  greater,
  lessThan,
  lessEqualThan,
  inOp,
  within,
  startsWith,
  endsWith,
  contains,
];

export const getPropertySupportedOperators = (propertyTypeDetails) => {
  const type = propertyTypeDetails.name || propertyTypeDetails.base;

  if (type === 'empty') {
    return [equal, notEqual, greaterEqualThan, greater, lessThan, lessEqualThan, inOp, within];
  }

  if (type === 'date') {
    return [within];
  }

  let operators = [];
  if (type === 'boolean' || type === 'string' || type === 'version' || type === 'number') {
    operators = operators.concat([equal, notEqual]);
  }
  if (type === 'number' || type === 'version') {
    operators = operators.concat([greaterEqualThan, greater, lessThan, lessEqualThan]);
  }
  if (type === 'string') {
    operators = operators.concat([startsWith, endsWith, contains]);
  }

  operators.push(inOp);
  return operators;
};

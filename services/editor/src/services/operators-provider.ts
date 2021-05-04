import { ValueType } from 'tweek-client';

export type ComplexValue<Op extends string> = Record<Op, unknown> & { $compare?: string };

export type GetOperatorValue = <Op extends string>(
  propertyValue: any,
  propertyTypeDetails: ValueType,
) => ComplexValue<Op> | unknown;

export type Operator<Op extends string> = {
  label: string;
  operatorValue: Op;
  getValue: GetOperatorValue;
};

const _createOperator = <Op extends string>(
  label: string,
  operatorValue: Op,
  isArray?: boolean,
): Operator<Op> => {
  let getValue: GetOperatorValue;

  if (isArray) {
    getValue = (propertyValue, propertyTypeDetails) =>
      _toArrayValue(operatorValue, propertyValue, propertyTypeDetails);
  } else {
    switch (operatorValue) {
      case '$eq':
        getValue = (propertyValue) => _toValue(propertyValue);
        break;
      default:
        getValue = (propertyValue, propertyTypeDetails) =>
          _toComplexValue(operatorValue, _toValue(propertyValue), propertyTypeDetails);
    }
  }

  return {
    label,
    operatorValue,
    getValue,
  };
};
const propertyTypeDetailsToComparer = ({ comparer: $compare }: ValueType) =>
  $compare ? { $compare } : {};

const _toArrayValue = <Op extends string>(
  operatorValue: Op,
  propertyValue: any,
  propertyTypeDetails: ValueType,
): ComplexValue<Op> => {
  if (Array.isArray(propertyValue)) {
    return _toComplexValue(operatorValue, propertyValue, propertyTypeDetails);
  }

  return _toComplexValue(operatorValue, propertyValue ? [propertyValue] : [], propertyTypeDetails);
};

const _toComplexValue = <Op extends string>(
  operatorValue: Op,
  propertyValue: any,
  propertyTypeDetails: ValueType,
) =>
  ({
    [operatorValue]: propertyValue,
    ...propertyTypeDetailsToComparer(propertyTypeDetails),
  } as ComplexValue<Op>);

const _toValue = <T>(propertyValue: T): T extends Array<infer Item> ? Item : T =>
  Array.isArray(propertyValue) && propertyValue.length > 0 ? propertyValue[0] : propertyValue;

export const equal = _createOperator('=', '$eq');
export const notEqual = _createOperator('!=', '$ne');
export const greaterEqualThan = _createOperator('>=', '$ge');
export const greater = _createOperator('>', '$gt');
export const lessThan = _createOperator('<', '$lt');
export const lessEqualThan = _createOperator('<=', '$le');
export const inOp = _createOperator('in', '$in', true);
export const within = _createOperator('within', '$withinTime');
export const startsWith = _createOperator('starts with', '$startsWith');
export const endsWith = _createOperator('ends with', '$endsWith');
export const contains = _createOperator('contains', '$contains');
export const containsArray = _createOperator('contains', '$contains', true);

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
  containsArray,
];

export const getPropertySupportedOperators = (propertyTypeDetails: ValueType) => {
  const type = propertyTypeDetails.name || propertyTypeDetails.base;

  if (type === 'empty') {
    return [
      equal,
      notEqual,
      greaterEqualThan,
      greater,
      lessThan,
      lessEqualThan,
      inOp,
      within,
      contains,
    ];
  }

  if (type === 'date') {
    return [within, greaterEqualThan, lessEqualThan];
  }

  if (type === 'array') {
    return [containsArray];
  }

  let operators: Operator<string>[] = [];
  if (type === 'boolean' || type === 'string' || type === 'version' || type === 'number') {
    operators = operators.concat([equal, notEqual]);
  }
  if (type === 'number' || propertyTypeDetails.comparer) {
    operators = operators.concat([greaterEqualThan, greater, lessThan, lessEqualThan]);
  }
  if (type === 'string') {
    operators = operators.concat([startsWith, endsWith, contains]);
  }

  operators.push(inOp);
  return operators;
};

import R from 'ramda';

// Modifiers
let modify = (fieldInfo, ...modifiers) => modifiers.reduce((field, m) => m(field), (fieldInfo));
let newType = (baseType, ...modifiers) => modify({ type: baseType }, ...modifiers);
let createAddPropModifer = (propName) => R.curry((payload, fieldInfo) => ({ ...fieldInfo, [propName]: payload }));

export const [description, compare, validate, defaultValue, typeAlias] =
    ['description', 'compare', 'validate', 'defaultValue', 'typeAlias'].map(createAddPropModifer);

let allowedValues = (values) => (typeInfo) => ({
  ...typeInfo,
  allowedValues: values.map(x => typeof(x) === 'object' ? x : { label: x, value: x }),
});

// types
export const types = {
  get String() {
    return newType('string');
  },
  Enum(...values) {
    return newType('string', typeAlias('enum'), allowedValues(values));
  },
  get Bool() {
    return newType('bool', defaultValue('false'), allowedValues([{ label: 'true', value: true }, { label: 'false', value: false }]));
  },
  get Number() {
    return newType('number');
  },
  get Empty() {
    return newType('empty');
  },
  get Version() {
    return newType('string', typeAlias('version'), compare('version'), validate(/[0-9.]/));
  },
};

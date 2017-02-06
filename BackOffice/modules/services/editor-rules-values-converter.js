import { types } from './TypesService';

export default function convert(value, fallbackValue, type) {
  const toStringConvertion = { isSucceeded: true, value: value.toString() };

  try {
    switch (type) {
      case '': return toStringConvertion;
      case 'string': return toStringConvertion;
      case 'boolean': return checkConvertedValue(JSON.parse(value), 'boolean', fallbackValue);
      case 'number': return checkConvertedValue(JSON.parse(value), 'number', fallbackValue);
      case 'custom': return toStringConvertion;
      default: {
        const customType = Object.keys(types)
          .map(x => types[x])
          .find(x => x.typeAlias === type);
        return !customType ?
          { isSucceeded: false, value: fallbackValue } :
          convert(value, fallbackValue, customType.type);
      }
    }
  } catch (exp) {
    return { isSucceeded: false, value: fallbackValue };
  }
}

const checkConvertedValue = (value, expectedType, fallbackValue) => {
  const isSucceeded = typeof value === expectedType
  return {
    isSucceeded,
    value: isSucceeded ? value : fallbackValue,
  };
};
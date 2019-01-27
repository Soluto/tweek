/* global process */
import fetch from '../utils/fetch';

export const types = {
  string: {
    name: 'string',
  },
  number: {
    name: 'number',
  },
  boolean: {
    name: 'boolean',
    allowedValues: [true, false],
  },
  date: {
    name: 'date',
    comparer: 'date',
  },
  object: {
    name: 'object',
  },
  array: {
    name: 'array',
    emptyValue: [],
  },
};

export async function refreshTypes() {
  const data = await fetch(`/values/@tweek/custom_types/_`);
  const loadedTypes = await data.json();

  for (const type of Object.keys(loadedTypes)) {
    types[type] = Object.assign({}, { name: type }, loadedTypes[type]);
  }
}

export function convertValue(value, targetType) {
  const type = typeof targetType === 'string' ? types[targetType] : targetType;
  if (!type) {
    throw new Error(`Unknown type ${targetType}`);
  }

  switch (type.base || type.name) {
  case 'boolean':
    return safeConvertToBaseType(value, 'boolean');
  case 'number':
    return safeConvertToBaseType(value, 'number');
  case 'array':
    return convertCheckArray(value, type.ofType ? x => convertValue(x, type.ofType) : x => x);
  case 'object':
    if (typeof value === types.object.name) {
      return value;
    }
    return safeConvertToBaseType(value, 'object');
  default:
    return value.toString();
  }
}

const convertCheckArray = (value, converter) =>
  Array.isArray(value) ? [...value.map(converter)] : converter(value);

export function isAllowedValue(valueType, value) {
  return (
    valueType &&
    (!valueType.allowedValues ||
      valueType.allowedValues.length === 0 ||
      valueType.allowedValues.includes(value))
  );
}

export function safeConvertValue(value, targetType) {
  try {
    return convertValue(value, targetType);
  } catch (err) {
    const typeName = targetType.ofType || targetType.base || targetType.name;
    return typeName !== types.string.name
      ? undefined
      : typeName === types.array.name ? [`${value}`] : `${value}`;
  }
}

function safeConvertToBaseType(value, type) {
  const jsonValue = JSON.parse(value);

  if (typeof jsonValue !== type) {
    throw new Error('Value could not be parsed to target type');
  }

  return jsonValue;
}

export function isStringValidJson(str, targetType) {
  try {
    const result = JSON.parse(str);
    const resultType = Array.isArray(result) ? 'array' : typeof result;
    if (targetType && resultType !== targetType.name && resultType !== targetType.base) {
      return false;
    }
    return true;
  } catch (e) {
    return false;
  }
}

export async function getValueTypeDefinition(key) {
  if (!key || key.length === 0) return types.string;
  try {
    const response = await fetch(`/manifests/${key}`);
    const manifest = await response.json();

    if (manifest.implementation.type === 'alias') {
      return getValueTypeDefinition(manifest.implementation.key);
    }

    return types[manifest.valueType] || types.string;
  } catch (err) {
    return types.string;
  }
}

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
  const data = await fetch('/api/types', { credentials: 'same-origin' });
  const loadedTypes = await data.json();

  for (const type of Object.keys(loadedTypes)) {
    types[type] = Object.assign({}, { name: type }, loadedTypes[type]);
  }
}

function convertTypedValue(value, targetType) {
  const type = typeof targetType === 'string' ? types[targetType] : targetType;

  if (!type) {
    throw new Error('Unknown type', targetType);
  }

  switch (type.base || type.name) {
  case 'boolean':
    return safeConvertToBaseType(value, 'boolean');
  case 'number':
    return safeConvertToBaseType(value, 'number');
  case 'array':
    return convertCheckArray(value, type.ofType || types.string);
  case 'object':
    return safeConvertToBaseType(value, 'object');
  default:
    return value.toString();
  }
}

export const convertValue = (value, type) => {
  switch (type.base || type.name) {
  case 'array':
  case 'object':
    return convertTypedValue(value, type);
  default:
    return convertCheckArray(value, type);
  }
};

const convertCheckArray = (value, type) =>
  Array.isArray(value)
    ? [...value.map(item => convertTypedValue(item, type))]
    : convertTypedValue(value, type);

export function isAllowedValue(valueType, value) {
  return (
    valueType &&
    (!valueType.allowedValues ||
      valueType.allowedValues.length == 0 ||
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

export function isStringValidJson(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

export async function getValueTypeDefinition(key) {
  if (!key || key.length === 0) return types.string;
  try {
    const response = await fetch(`/api/manifests/${key}`, { credentials: 'same-origin' });
    const manifest = await response.json();

    if (manifest.implementation.type === 'alias') {
      return getValueTypeDefinition(manifest.implementation.key);
    }

    return types[manifest.valueType] || types.string;
  } catch (err) {
    return types.string;
  }
}

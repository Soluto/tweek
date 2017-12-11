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
  },
  object: {
    name: 'object',
  },
};

export async function refreshTypes() {
  const data = await fetch('/api/types', { credentials: 'same-origin' });
  const loadedTypes = await data.json();

  for (const type of Object.keys(loadedTypes)) {
    types[type] = Object.assign({}, { name: type }, loadedTypes[type]);
  }
}

export function convertValue(value, targetType) {
  const type = typeof targetType === 'string' ? types[targetType] : targetType;

  if (!type) {
    throw new Error('Unknown type', targetType);
  }

  switch (type.base || type.name) {
  case 'boolean':
    return safeConvertToBaseType(value, 'boolean');
  case 'number':
    return safeConvertToBaseType(value, 'number');
  case 'object':
    return safeConvertToBaseType(value, 'object');
  default:
    return value.toString();
  }
}

export function safeConvertValue(value, targetType) {
  try {
    return convertValue(value, targetType);
  } catch (err) {
    return targetType === types.boolean.name ? '' : `${value}`;
  }
}

function safeConvertToBaseType(value, type) {
  const jsonValue = JSON.parse(value);

  if (typeof jsonValue !== type) {
    throw new Error('Value could not be parsed to target type');
  }

  return jsonValue;
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

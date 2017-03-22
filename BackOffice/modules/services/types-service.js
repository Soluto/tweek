export let types = {
  string: {
    name: 'string'
  },
  number: {
    name: 'number'
  },
  boolean: {
    name: 'boolean'
  },
  date: {
    name: 'date'
  }
};

export async function refreshTypes() {
  let data = await fetch(`/api/types`, { credentials: 'same-origin' });
  let loadedTypes = await data.json();

  for (let type of Object.keys(loadedTypes)) {
    types[type] = Object.assign({}, { name: type }, loadedTypes[type]);
  }
}

export function convertValue(value, targetType) {
  let type = types[targetType];

  if (!type)
    throw new Error("Unknown type", targetType);

  switch (type.base || type.name) {
    case 'boolean':
      return safeConvertToBaseType(value, 'boolean');
    case 'number':
      return safeConvertToBaseType(value, 'number');
    default:
      return value.toString();
  }
}

export function safeConvertValue(value, targetType) {
  try {
    return convertValue(value, targetType);
  }
  catch (err) {
    return targetType === types.boolean.name ? '' : '' + value
  }
}

function safeConvertToBaseType(value, type) {
  let jsonValue = JSON.parse(value);

  if (typeof jsonValue != type) {
    throw new Error("Value could not be parsed to target type");
  }

  return jsonValue;
}
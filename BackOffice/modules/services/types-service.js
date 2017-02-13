export let types = {
  string: {
    base: 'string'
  },
  number: {
    base: 'number'
  },
  boolean: {
    base: 'boolean'
  }
};

export async function refreshTypes() {
  let data = await fetch(`/api/types`, {credentials: 'same-origin'});
  let loadedTypes = await data.json();

  types = Object.assign({}, types, loadedTypes);
}

export function convertValue(value, targetType) {
  let type = types[targetType];

  if (!type)
    throw new Error("Unknown type", targetType);

  switch (type.base){
    case 'boolean':
      return safeConvertToBaseType(value, 'boolean');
    case 'number':
      return safeConvertToBaseType(value, 'number');
    default:
      return value.toString();
  }
}

function safeConvertToBaseType(value, type){
  let jsonValue = JSON.parse(value);

  if (typeof jsonValue != type) {
    throw new Error("Value could not be parsed to target type");
  }

  return jsonValue;
}
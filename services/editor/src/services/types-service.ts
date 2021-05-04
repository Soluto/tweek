import { ValueType } from 'tweek-client';
import { tweekClient, tweekManagementClient } from '../utils';

export type KnownTypes = 'string' | 'number' | 'boolean' | 'date' | 'object' | 'array';

export type ValueTypes = Record<KnownTypes | string, ValueType>;

export const types: ValueTypes = {
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
  const loadedTypes = await tweekClient.getValues<Record<string, object>>('@tweek/custom_types/_');

  for (const type of Object.keys(loadedTypes)) {
    types[type] = { name: type, ...loadedTypes[type] };
  }
}

export function convertValue(value: string, targetType: string | ValueType): any {
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
      return type.ofType ? convertCheckArray(value, (x) => convertValue(x, type.ofType!)) : value;
    case 'object':
      if (typeof value === types.object.name) {
        return value;
      }
      return safeConvertToBaseType(value, 'object');
    default:
      return value.toString();
  }
}

const convertCheckArray = <T, U = T>(value: T, converter: (x: T) => U) =>
  Array.isArray(value) ? value.map(converter) : converter(value);

export function isAllowedValue(valueType: ValueType | undefined, value: any) {
  return (
    valueType &&
    (!valueType.allowedValues ||
      valueType.allowedValues.length === 0 ||
      valueType.allowedValues.includes(value))
  );
}

export function safeConvertValue(value: string, targetType: ValueType) {
  try {
    return convertValue(value, targetType);
  } catch (err) {
    const typeName = targetType.ofType || targetType.base || targetType.name;
    return typeName !== types.string.name
      ? undefined
      : typeName === types.array.name
      ? [`${value}`]
      : `${value}`;
  }
}

function safeConvertToBaseType(value: string, type: string) {
  const jsonValue = JSON.parse(value);

  if (typeof jsonValue !== type) {
    throw new Error('Value could not be parsed to target type');
  }

  return jsonValue;
}

export function isStringValidJson(str: string, targetType?: ValueType) {
  try {
    const result = JSON.parse(str);
    const resultType = Array.isArray(result) ? 'array' : typeof result;
    return !targetType || resultType === targetType.name || resultType === targetType.base;
  } catch (e) {
    return false;
  }
}

export async function getValueTypeDefinition(keyPath: string): Promise<ValueType> {
  if (!keyPath) return types.string;
  try {
    const manifest = await tweekManagementClient.getKeyManifest(keyPath);

    if (manifest.implementation.type === 'alias') {
      return getValueTypeDefinition(manifest.implementation.key as string);
    }

    return types[manifest.valueType] || types.string;
  } catch (err) {
    return types.string;
  }
}

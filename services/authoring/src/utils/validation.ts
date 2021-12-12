import express from 'express';
import { Errors } from 'typescript-rest';
import Ajv, { Schema } from 'ajv';
import { Type } from '@sinclair/typebox';

const ajv = new Ajv();

export default (schema: Schema) => (req: express.Request): express.Request => {
  const ok = ajv.validate(schema, req.body);
  if (ok) {
    throw new Errors.BadRequestError('Bad format');
  }
  return req;
};

enum KeyTypeEnum {
  string,
  number,
  boolean,
  date,
  object,
  array,
}

enum KeyRuleTypeEnum {
  SingleVariant,
}

const KeyRuleMatcherType = Type.Object({});

export const KeyRuleType = Type.Object({
  Matcher: KeyRuleMatcherType,
  Value: Type.Any(), // TODO: Add generics
  Type: Type.Enum(KeyRuleTypeEnum),
});

export const KeyImplementationType = Type.Object({
  partitions: Type.Array(Type.Any()), // TODO: Complete
  valueType: Type.Enum(KeyTypeEnum), // TODO: Set values
  rules: Type.Array(KeyRuleType),
  defaultValue: Type.Optional(Type.Any()), // TODO: Add generics/ref
});

export const KeyManifestType = Type.Object({
  key_path: Type.String(), // TODO: Regex url
  meta: Type.Object({
    archived: Type.Boolean(),
    name: Type.String(), // TODO: regex
    description: Type.String(),
    tags: Type.Array(Type.String()),
  }),
  implementation: Type.Object({
    type: Type.Literal('file'),
    format: Type.Literal('jpad'),
  }),
  valueType: Type.Enum(KeyTypeEnum),
  dependencies: Type.Array(Type.String()), // TODO: Regex
});

export const KeyUpdateModelType = Type.Object({
  implementation: KeyImplementationType,
  manifest: KeyManifestType,
});

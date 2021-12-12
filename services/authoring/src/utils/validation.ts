import express from 'express';
import { Errors } from 'typescript-rest';
import Ajv, { Schema } from 'ajv';
import addFormats from 'ajv-formats';
import { TLiteral, TUnion, Type } from '@sinclair/typebox';

//const ajv = new Ajv();
const ajv = addFormats(new Ajv({}), [
  'date-time',
  'time',
  'date',
  'email',
  'hostname',
  'ipv4',
  'ipv6',
  'uri',
  'uri-reference',
  'uuid',
  'uri-template',
  'json-pointer',
  'relative-json-pointer',
  'regex',
])
  .addKeyword('kind')
  .addKeyword('modifier');

export default (schema: Schema) => (req: express.Request): express.Request => {
  const validate = ajv.compile(schema);
  const ok = validate(req.body);
  if (!ok) {
    throw new Errors.BadRequestError('Bad key format:\n' + JSON.stringify(validate.errors, null, 2));
  }
  return req;
};

type IntoStringUnion<T> = { [K in keyof T]: T[K] extends string ? TLiteral<T[K]> : never };

function StringUnion<T extends string[]>(values: [...T]): TUnion<IntoStringUnion<T>> {
  return { enum: values } as any;
}

const KeyNameRegEx = /(^(@?)[a-z0-9_]+)(\/(@?)([a-z0-9_])+)*$/;

const RuleTypes = ['SingleVariant', 'MultiVariant'];

const KeyRuleMatcherType = Type.Object({});

export const KeyRuleType = Type.Object({
  Matcher: KeyRuleMatcherType,
  Value: Type.Any(), // TODO: Add generics
  Type: StringUnion(RuleTypes),
});

export const KeyImplementationType = Type.Union([
  Type.String(),
  Type.Object({
    type: Type.Literal('const'),
    value: Type.Any(),
  }),
  Type.Object({
    type: Type.Literal('alias'),
    key: Type.RegEx(KeyNameRegEx),
  }),
]);

export const ValueTypeStrings = ['string', 'number', 'boolean', 'date', 'object', 'array'];

export const KeyManifestType = Type.Object({
  key_path: Type.RegEx(KeyNameRegEx),
  meta: Type.Object({
    archived: Type.Optional(Type.Boolean()),
    name: Type.Optional(Type.String()), // TODO: regex
    description: Type.Optional(Type.String()),
    tags: Type.Optional(Type.Array(Type.String())),
  }),
  implementation: Type.Optional(
    Type.Object({
      type: StringUnion(['file', 'const', 'alias']),
      format: Type.Optional(Type.Literal('jpad')),
    }),
  ),
  valueType: Type.Optional(StringUnion(ValueTypeStrings)),
  dependencies: Type.Optional(Type.Array(Type.String())), // TODO: Regex
});

export const KeyUpdateModelType = Type.Object({
  implementation: Type.Optional(KeyImplementationType),
  manifest: KeyManifestType,
});

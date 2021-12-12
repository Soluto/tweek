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
    throw new Errors.BadRequestError('Bad key format:\n' + validate.errors);
  }
  return req;
};

type IntoStringUnion<T> = { [K in keyof T]: T[K] extends string ? TLiteral<T[K]> : never };

function StringUnion<T extends string[]>(values: [...T]): TUnion<IntoStringUnion<T>> {
  return { enum: values } as any;
}

const RuleTypes = ['SingleVariant', 'MultiVariant'];

const KeyRuleMatcherType = Type.Object({});

export const KeyRuleType = Type.Object({
  Matcher: KeyRuleMatcherType,
  Value: Type.Any(), // TODO: Add generics
  Type: StringUnion(RuleTypes),
});

export const KeyImplementationType = Type.String();

export const ValueTypes = ['string', 'number', 'boolean', 'date', 'object', 'array'];

const KeyNameRegEx = /(^(@?)[a-z0-9_]+)(\/(@?)([a-z0-9_])+)*$/;

export const KeyManifestType = Type.Object({
  key_path: Type.RegEx(KeyNameRegEx),
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
  valueType: StringUnion(ValueTypes),
  dependencies: Type.Array(Type.String()), // TODO: Regex
});

export const KeyUpdateModelType = Type.Object({
  implementation: KeyImplementationType,
  manifest: KeyManifestType,
});

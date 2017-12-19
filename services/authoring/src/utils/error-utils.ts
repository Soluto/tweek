import { ValidationError } from '../repositories/git-repository';

type errorMapping = [Function, number];

const errorMapping = new WeakMap<Function, number>([
  [ValidationError, 400]
]);

export function getErrorStatusCode(error): number {
  if (errorMapping.has(error)) {
    return errorMapping[error];
  }
  return error.statusCode || 500;
}

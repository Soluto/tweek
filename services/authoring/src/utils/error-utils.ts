import { ValidationError } from '../repositories/git-repository';

type errorMapping = [Function, number];

const errorMapping: errorMapping[] = [[ValidationError, 400]];

export function getErrorStatusCode(error): number {
  for (const [errorType, errorCode] of errorMapping) {
    if (error instanceof errorType) {
      return errorCode;
    }
  }
  return error.statusCode || 500;
}

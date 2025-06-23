import { ValidationError } from '../../shared/errors/ValidationError';

export class PairValidationError extends ValidationError {
  static nameLength(value: string): PairValidationError {
    return new PairValidationError(
      'ペア名は1文字である必要があります',
      'ペア名',
      value
    );
  }

  static nameFormat(value: string): PairValidationError {
    return new PairValidationError(
      'ペア名は大文字のアルファベット1文字である必要があります',
      'ペア名',
      value
    );
  }
} 
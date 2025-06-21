export class PairNameValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PairNameValidationError';
  }

  static lengthError(): PairNameValidationError {
    return new PairNameValidationError('ペア名は1文字である必要があります');
  }

  static formatError(): PairNameValidationError {
    return new PairNameValidationError('ペア名は大文字のアルファベット1文字である必要があります');
  }
}
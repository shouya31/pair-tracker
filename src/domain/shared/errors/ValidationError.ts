import { DomainError } from '../DomainError';

/**
 * バリデーションエラーの基底クラス
 * 値の検証に関する基本的なエラーを表現します
 */
export class ValidationError extends DomainError {
  constructor(
    message: string,
    public readonly propertyName: string,
    public readonly value?: unknown
  ) {
    super(`${propertyName}の検証に失敗しました: ${message}`);
    this.name = 'ValidationError';
  }

  static required(propertyName: string): ValidationError {
    return new ValidationError(
      'この項目は必須です',
      propertyName
    );
  }

  static maxLength(propertyName: string, value: string, maxLength: number): ValidationError {
    return new ValidationError(
      `${maxLength}文字以下で入力してください（現在: ${value.length}文字）`,
      propertyName,
      value
    );
  }

  static minLength(propertyName: string, value: string, minLength: number): ValidationError {
    return new ValidationError(
      `${minLength}文字以上で入力してください（現在: ${value.length}文字）`,
      propertyName,
      value
    );
  }

  static exactLength(propertyName: string, value: string, length: number): ValidationError {
    return new ValidationError(
      `${length}文字である必要があります`,
      propertyName,
      value
    );
  }

  static format(propertyName: string, value: unknown, format: string): ValidationError {
    return new ValidationError(
      `${format}形式である必要があります`,
      propertyName,
      value
    );
  }
}

/**
 * 必須項目のエラー
 */
export class RequiredValueError extends ValidationError {
  constructor(propertyName: string) {
    super('この項目は必須です', propertyName, undefined);
  }
}

/**
 * 文字列の長さに関するエラー
 */
export class StringLengthError extends ValidationError {
  constructor(
    propertyName: string,
    value: string,
    public readonly min?: number,
    public readonly max?: number
  ) {
    const message = createLengthErrorMessage(min, max, value.length);
    super(message, propertyName, value);
  }
}

/**
 * 形式（フォーマット）に関するエラー
 */
export class FormatError extends ValidationError {
  constructor(
    propertyName: string,
    value: string,
    format: string
  ) {
    super(`${format}の形式で入力してください`, propertyName, value);
  }
}

// ヘルパー関数
function createLengthErrorMessage(min?: number, max?: number, actual?: number): string {
  if (min !== undefined && max !== undefined) {
    return `${min}文字以上${max}文字以下で入力してください（現在: ${actual}文字）`;
  }
  if (min !== undefined) {
    return `${min}文字以上で入力してください（現在: ${actual}文字）`;
  }
  if (max !== undefined) {
    return `${max}文字以下で入力してください（現在: ${actual}文字）`;
  }
  return '文字数が不正です';
}
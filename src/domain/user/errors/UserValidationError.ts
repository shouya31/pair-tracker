import { ValidationError } from '../../shared/errors/ValidationError';

export class UserValidationError extends ValidationError {
  static nameRequired(): UserValidationError {
    return new UserValidationError(
      'この項目は必須です',
      '名前'
    );
  }

  static emailInvalid(email: string): UserValidationError {
    return new UserValidationError(
      `無効なメールアドレスです: ${email}`,
      'メールアドレス',
      email
    );
  }
} 
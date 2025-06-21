import { ValidationError } from './ValidationError';

export class EmailValidationError extends ValidationError {
  static invalid(email: string): EmailValidationError {
    return new EmailValidationError(`無効なメールアドレスです: ${email}`, 'メールアドレス', email);
  }
} 
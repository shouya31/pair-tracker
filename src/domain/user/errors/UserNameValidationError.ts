import { ValidationError } from '../../shared/errors/ValidationError';

export class UserNameValidationError extends ValidationError {
  static required(): UserNameValidationError {
    return new UserNameValidationError('名前を入力してください', '名前', undefined);
  }
} 
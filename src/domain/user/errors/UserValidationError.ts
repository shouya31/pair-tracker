import { ValidationError } from '../../shared/errors/ValidationError';
import { DomainError } from '../../shared/DomainError';

export class UserNameRequiredError extends ValidationError {
  constructor() {
    super('名前を入力してください', '名前', undefined);
  }
}

export class EmailFormatError extends ValidationError {
  constructor(value: string) {
    super(
      'RFC 5321に準拠した有効なメールアドレスを入力してください',
      'メールアドレス',
      value
    );
  }
}

export class UserAlreadyExistsError extends DomainError {
  constructor(email: string) {
    super(`このメールアドレスは既に登録されています: ${email}`);
  }
} 
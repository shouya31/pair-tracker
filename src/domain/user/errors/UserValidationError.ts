import { ValidationError } from '../../shared/errors/ValidationError';

export class UserNameRequiredError extends ValidationError {
  constructor() {
    super('名前を入力してください', 'ユーザー名', undefined);
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
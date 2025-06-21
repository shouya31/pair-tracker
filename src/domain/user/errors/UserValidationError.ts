import { RequiredValueError, FormatError } from '../../shared/errors/ValidationError';

export class UserNameRequiredError extends RequiredValueError {
  constructor() {
    super('ユーザー名');
  }
}

export class EmailFormatError extends FormatError {
  constructor(value: string) {
    super('メールアドレス', value, 'メールアドレス');
  }
} 
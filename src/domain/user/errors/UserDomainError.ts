import { DomainError } from '../../shared/DomainError';

export type UserDomainErrorType = 'ALREADY_EXISTS' | 'NOT_FOUND';

export class UserDomainError extends DomainError {
  constructor(
    message: string,
    private readonly _type: UserDomainErrorType
  ) {
    super(message);
  }

  get type(): UserDomainErrorType {
    return this._type;
  }

  static alreadyExists(email: string): UserDomainError {
    return new UserDomainError(
      `このメールアドレスは既に使用されています: ${email}`,
      'ALREADY_EXISTS'
    );
  }

  static notFound(id: string): UserDomainError {
    return new UserDomainError(
      `指定されたユーザーが見つかりません: ${id}`,
      'NOT_FOUND'
    );
  }
} 
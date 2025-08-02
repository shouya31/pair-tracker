import { DomainError, createDomainError } from '../../shared/DomainError';

export function userAlreadyExists(email: string): DomainError {
  return createDomainError(`このメールアドレスは既に使用されています: ${email}`);
}

export function userNotFound(id: string): DomainError {
  return createDomainError(`指定されたユーザーが見つかりません: ${id}`);
}

export function emailInvalidFormat(email: string): DomainError {
  return createDomainError(`無効なメールアドレス形式です: ${email}`);
}

export function userNameERequiredrror(): DomainError {
  return createDomainError('名前は必須です');
}

export function emailRequiredError(): DomainError {
  return createDomainError('メールアドレスは必須です');
}
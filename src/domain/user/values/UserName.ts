import { Result, ok, err } from '../../shared/Result';
import { DomainError, createDomainError, ERROR_CODES } from '../../shared/DomainError';

export type UserName = {
  value: string;
}

export const createUserName = (value: string): Result<UserName, DomainError> => {
  if (!value.trim()) {
    return err(createDomainError('ユーザー名の入力が必須です', ERROR_CODES.VALIDATION_ERROR));
  }
  return ok({ value: value.trim() });
}

export const getUserName = (userName: UserName): string => {
  return userName.value;
}

export const equalsUserName = (a: UserName, b: UserName): boolean => {
  return a.value === b.value;
}
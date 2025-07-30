import { Result, ok, err } from '../../shared/Result';

export type UserName = {
  value: string;
}

export type UserNameError = {
  message: string;
};

export const createUserName = (value: string): Result<UserName, UserNameError> => {
  if (!value.trim()) {
    return err({ message: 'ユーザー名の入力が必須です' });
  }
  return ok({ value: value.trim() });
}

export const getUserName = (userName: UserName): string => {
  return userName.value;
}

export const equalsUserName = (a: UserName, b: UserName): boolean => {
  return a.value === b.value;
} 
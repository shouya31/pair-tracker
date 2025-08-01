import { UserStatus } from './enums/UserStatus';
import { Email, createEmail } from '../shared/Email';
import { UserName, createUserName } from './values/UserName';
import { randomUUID } from 'crypto';
import { Result, ok, err, isOk, isErr } from '../shared/Result';
import { DomainError } from '../shared/DomainError';

export type User = {
  userId: string;
  name: UserName;
  email: Email;
  status: UserStatus;
};

export function createUser(name: string, email: string): Result<User, DomainError> {
  const nameResult = createUserName(name);
  if (isErr(nameResult)) {
    return err(nameResult.error);
  }

  const emailResult = createEmail(email);
  if (isErr(emailResult)) {
    return err(emailResult.error);
  }

  return ok({
    userId: randomUUID(),
    name: nameResult.value,
    email: emailResult.value,
    status: UserStatus.Enrolled,
  });
}

export type RebuildUserError = DomainError;

export function rebuildUser(
  id: string,
  name: string,
  email: string,
  status: UserStatus
): Result<User, RebuildUserError> {
  const nameResult = createUserName(name);
  if (isErr(nameResult)) {
    return err(nameResult.error);
  }

  const emailResult = createEmail(email);
  if (isErr(emailResult)) {
    return err(emailResult.error);
  }

  return ok({
    userId: id,
    name: nameResult.value,
    email: emailResult.value,
    status,
  });
}

export function getUserId(user: User): string {
  return user.userId;
}

export function getUserNameVO(user: User): string {
  return user.name.value;
}

export function getUserEmail(user: User): string {
  return user.email.value;
}

export function getUserEmailVO(user: User): Email {
  return user.email;
}

export function getUserStatus(user: User): UserStatus {
  return user.status;
}

export function equalsUser(a: User, b: User): boolean {
  return a.userId === b.userId;
}
import { UserStatus } from './enums/UserStatus';
import { Email } from '../shared/Email';
import { randomUUID } from 'crypto';
import { UserValidationError } from './errors/UserValidationError';

export type User = {
  userId: string;
  name: string;
  email: Email;
  status: UserStatus;
};

export function createUser(name: string, email: string): User {
  if (!name.trim()) {
    throw UserValidationError.nameRequired();
  }
  return {
    userId: randomUUID(),
    name,
    email: Email.create(email),
    status: UserStatus.Enrolled,
  };
}

export function rebuildUser(id: string, name: string, email: string, status: UserStatus): User {
  return {
    userId: id,
    name,
    email: Email.create(email),
    status,
  };
}

export function getUserId(user: User): string {
  return user.userId;
}

export function getUserName(user: User): string {
  return user.name;
}

export function getUserEmail(user: User): string {
  return user.email.getValue();
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
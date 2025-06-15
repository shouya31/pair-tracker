import { Email } from '../shared/Email';

export enum UserStatus {
  Enrolled = 'enrolled',
  Suspended = 'suspended',
  Withdrawn = 'withdrawn'
}

export class User {
  private readonly _userId: string;
  private readonly _email: Email;
  private readonly _status: UserStatus;

  constructor(email: Email, status: UserStatus = UserStatus.Enrolled) {
    this._userId = crypto.randomUUID();
    this._email = email;
    this._status = status;
  }

  get userId(): string {
    return this._userId;
  }

  get email(): Email {
    return this._email;
  }

  get status(): UserStatus {
    return this._status;
  }

  isActive(): boolean {
    return this._status === UserStatus.Enrolled;
  }

  equals(other: User): boolean {
    return this._userId === other._userId;
  }
} 
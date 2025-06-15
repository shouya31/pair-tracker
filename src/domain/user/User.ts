import { Entity } from '../shared/Entity';
import { Email } from '../shared/Email';
import { UserStatus } from './UserStatus';

export class User extends Entity {
  private constructor(
    id: string,
    private email: Email,
    private status: UserStatus = UserStatus.ENROLLED,
  ) {
    super(id);
  }

  static create(email: Email): User {
    return new User(crypto.randomUUID(), email);
  }

  static reconstruct(id: string, email: Email, status: UserStatus): User {
    return new User(id, email, status);
  }

  getEmail(): Email {
    return this.email;
  }

  getStatus(): UserStatus {
    return this.status;
  }

  changeStatus(newStatus: UserStatus): void {
    if (this.status === UserStatus.WITHDRAWN) {
      throw new Error('Cannot change status of withdrawn user');
    }
    this.status = newStatus;
  }

  isEnrolled(): boolean {
    return this.status === UserStatus.ENROLLED;
  }

  equals(other: User): boolean {
    if (!(other instanceof User)) {
      return false;
    }
    return this.getId() === other.getId();
  }
} 
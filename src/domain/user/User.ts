import { UserStatus } from './enums/UserStatus';
import { Email } from '../shared/Email';
import { randomUUID } from 'crypto';

export class User {
  private constructor(
    private readonly userId: string,
    private readonly name: string,
    private readonly email: Email,
    private status: UserStatus,
  ) {}

  public static create(name: string, email: string): User {
    if (!name.trim()) {
      throw new Error('名前を入力してください');
    }
    return new User(
      randomUUID(),
      name,
      Email.create(email),
      UserStatus.Enrolled, // 初期ステータスは「在籍中」
    );
  }

  public static rebuild(id: string, name: string, email: string, status: UserStatus): User {
    return new User(
      id,
      name,
      Email.create(email),
      status,
    );
  }

  public getUserId(): string {
    return this.userId;
  }

  public getName(): string {
    return this.name;
  }

  public getEmail(): string {
    return this.email.getValue();
  }

  public getEmailVO(): Email {
    return this.email;
  }

  public getStatus(): UserStatus {
    return this.status;
  }
}
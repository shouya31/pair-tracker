import { User } from './User';
import { Email } from './vo/Email';

export interface IUserRepository {
  findByEmail(email: Email): Promise<User | null>;

  findById(id: string): Promise<User | null>;

  findByIds(ids: string[]): Promise<User[]>;

  findAll(): Promise<User[]>;

  save(user: User): Promise<void>;
}
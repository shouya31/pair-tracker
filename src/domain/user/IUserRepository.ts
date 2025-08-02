import { User } from './User';
import { Email } from '../shared/Email';
import { Result } from '../shared/Result';
import { DomainError } from '../shared/DomainError';

export interface IUserRepository {
  findByEmail(email: Email): Promise<User | null>;

  findById(id: string): Promise<User | null>;

  findByIds(ids: string[]): Promise<User[]>;

  findAll(): Promise<User[]>;

  save(user: User): Promise<Result<void, DomainError>>;
}
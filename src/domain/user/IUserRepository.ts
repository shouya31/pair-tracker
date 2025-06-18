import { User } from './User';
import { Email } from '../shared/Email';

export interface IUserRepository {
  findByEmail(email: Email): Promise<User | null>;

  findById(id: string): Promise<User | null>;

  save(user: User): Promise<void>;
}
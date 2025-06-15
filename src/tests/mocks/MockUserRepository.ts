import { IUserRepository } from '../../domain/user/IUserRepository';
import { User } from '../../domain/user/User';
import { Email } from '../../domain/shared/Email';

export class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  async save(user: User): Promise<void> {
    const index = this.users.findIndex(u => u.getId() === user.getId());
    if (index !== -1) {
      this.users[index] = user;
    } else {
      this.users.push(user);
    }
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find(u => u.getId() === id) || null;
  }

  async findByEmail(email: Email): Promise<User | null> {
    return this.users.find(u => u.getEmail().equals(email)) || null;
  }

  async findAll(): Promise<User[]> {
    return [...this.users];
  }

  async delete(id: string): Promise<void> {
    this.users = this.users.filter(u => u.getId() !== id);
  }

  // テスト用のヘルパーメソッド
  clear(): void {
    this.users = [];
  }
} 
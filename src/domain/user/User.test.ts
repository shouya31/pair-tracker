import { User, UserStatus } from './User';
import { Email } from '../shared/Email';

describe('User', () => {
  const email = new Email('test@example.com');

  describe('constructor', () => {
    it('デフォルトでEnrolledステータスで作成される', () => {
      const user = new User(email);
      expect(user.status).toBe(UserStatus.Enrolled);
      expect(user.isActive()).toBe(true);
    });

    it('指定したステータスで作成できる', () => {
      const user = new User(email, UserStatus.Suspended);
      expect(user.status).toBe(UserStatus.Suspended);
      expect(user.isActive()).toBe(false);
    });
  });

  describe('equals', () => {
    it('同じユーザーIDの場合trueを返す', () => {
      const user1 = new User(email);
      const user2 = { ...user1 };
      expect(user1.equals(user2 as User)).toBe(true);
    });

    it('異なるユーザーIDの場合falseを返す', () => {
      const user1 = new User(email);
      const user2 = new User(email);
      expect(user1.equals(user2)).toBe(false);
    });
  });

  it('一意のIDが生成される', () => {
    const user1 = new User(email);
    const user2 = new User(email);
    expect(user1.userId).not.toBe(user2.userId);
  });
}); 
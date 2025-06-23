import { User } from './User';
import { UserStatus } from './enums/UserStatus';
import { UserValidationError } from './errors/UserValidationError';

describe('User', () => {
  describe('create', () => {
    test('有効な値でUserを作成できる', () => {
      const user = User.create('test user', 'test@example.com');
      expect(user.getName()).toBe('test user');
      expect(user.getEmail()).toBe('test@example.com');
      expect(user.getStatus()).toBe(UserStatus.Enrolled);
    });

    test('名前が空文字の場合はエラーになる', () => {
      expect(() => User.create('', 'test@example.com')).toThrow(UserValidationError);
      expect(() => User.create('', 'test@example.com')).toThrow('名前の検証に失敗しました: この項目は必須です');
    });

    test('名前が空白文字のみの場合はエラーになる', () => {
      expect(() => User.create('   ', 'test@example.com')).toThrow(UserValidationError);
      expect(() => User.create('   ', 'test@example.com')).toThrow('名前の検証に失敗しました: この項目は必須です');
    });

    test('メールアドレスが無効な場合はエラーになる', () => {
      expect(() => User.create('test user', 'invalid-email')).toThrow(UserValidationError);
      expect(() => User.create('test user', 'invalid-email')).toThrow('メールアドレスの検証に失敗しました: 無効なメールアドレスです: invalid-email');
    });
  });

  describe('rebuild', () => {
    test('有効な値でUserを再構築できる', () => {
      const user = User.rebuild('test-id', 'test user', 'test@example.com', UserStatus.Enrolled);
      expect(user.getUserId()).toBe('test-id');
      expect(user.getName()).toBe('test user');
      expect(user.getEmail()).toBe('test@example.com');
      expect(user.getStatus()).toBe(UserStatus.Enrolled);
    });

    test('メールアドレスが無効な場合はエラーになる', () => {
      expect(() => User.rebuild('test-id', 'test user', 'invalid-email', UserStatus.Enrolled)).toThrow(UserValidationError);
      expect(() => User.rebuild('test-id', 'test user', 'invalid-email', UserStatus.Enrolled)).toThrow('メールアドレスの検証に失敗しました: 無効なメールアドレスです: invalid-email');
    });
  });

  describe('equals', () => {
    test('同じIDを持つUser同士を比較するとtrueを返す', () => {
      const user1 = User.rebuild('same-id', 'user1', 'test1@example.com', UserStatus.Enrolled);
      const user2 = User.rebuild('same-id', 'user2', 'test2@example.com', UserStatus.Enrolled);
      expect(user1.equals(user2)).toBe(true);
    });

    test('異なるIDを持つUser同士を比較するとfalseを返す', () => {
      const user1 = User.rebuild('id1', 'test user', 'test@example.com', UserStatus.Enrolled);
      const user2 = User.rebuild('id2', 'test user', 'test@example.com', UserStatus.Enrolled);
      expect(user1.equals(user2)).toBe(false);
    });
  });
});
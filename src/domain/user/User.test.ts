import {
  createUser,
  rebuildUser,
  getUserId,
  getUserName,
  getUserEmail,
  getUserStatus,
  equalsUser,
} from './User';
import { UserStatus } from './enums/UserStatus';
import { UserValidationError } from './errors/UserValidationError';

describe('User', () => {
  describe('createUser', () => {
    test('有効な値でUserを作成できる', () => {
      const user = createUser('test user', 'test@example.com');
      expect(getUserName(user)).toBe('test user');
      expect(getUserEmail(user)).toBe('test@example.com');
      expect(getUserStatus(user)).toBe(UserStatus.Enrolled);
    });

    test('名前が空文字の場合はエラーになる', () => {
      expect(() => createUser('', 'test@example.com')).toThrow(UserValidationError);
      expect(() => createUser('', 'test@example.com')).toThrow('名前の検証に失敗しました: この項目は必須です');
    });

    test('名前が空白文字のみの場合はエラーになる', () => {
      expect(() => createUser('   ', 'test@example.com')).toThrow(UserValidationError);
      expect(() => createUser('   ', 'test@example.com')).toThrow('名前の検証に失敗しました: この項目は必須です');
    });

    test('メールアドレスが無効な場合はエラーになる', () => {
      expect(() => createUser('test user', 'invalid-email')).toThrow(UserValidationError);
      expect(() => createUser('test user', 'invalid-email')).toThrow('メールアドレスの検証に失敗しました: 無効なメールアドレスです: invalid-email');
    });
  });

  describe('rebuildUser', () => {
    test('有効な値でUserを再構築できる', () => {
      const user = rebuildUser('test-id', 'test user', 'test@example.com', UserStatus.Enrolled);
      expect(getUserId(user)).toBe('test-id');
      expect(getUserName(user)).toBe('test user');
      expect(getUserEmail(user)).toBe('test@example.com');
      expect(getUserStatus(user)).toBe(UserStatus.Enrolled);
    });

    test('メールアドレスが無効な場合はエラーになる', () => {
      expect(() => rebuildUser('test-id', 'test user', 'invalid-email', UserStatus.Enrolled)).toThrow(UserValidationError);
      expect(() => rebuildUser('test-id', 'test user', 'invalid-email', UserStatus.Enrolled)).toThrow('メールアドレスの検証に失敗しました: 無効なメールアドレスです: invalid-email');
    });
  });

  describe('equalsUser', () => {
    test('同じIDを持つUser同士を比較するとtrueを返す', () => {
      const user1 = rebuildUser('same-id', 'user1', 'test1@example.com', UserStatus.Enrolled);
      const user2 = rebuildUser('same-id', 'user2', 'test2@example.com', UserStatus.Enrolled);
      expect(equalsUser(user1, user2)).toBe(true);
    });

    test('異なるIDを持つUser同士を比較するとfalseを返す', () => {
      const user1 = rebuildUser('id1', 'test user', 'test@example.com', UserStatus.Enrolled);
      const user2 = rebuildUser('id2', 'test user', 'test@example.com', UserStatus.Enrolled);
      expect(equalsUser(user1, user2)).toBe(false);
    });
  });
});
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
    describe('正常系', () => {
      test('nameとemailが有効な場合、statusがUserStatus.EnrolledのUserが生成される', () => {
        const user = createUser('test user', 'test@example.com');
        expect(getUserName(user)).toBe('test user');
        expect(getUserEmail(user)).toBe('test@example.com');
        expect(getUserStatus(user)).toBe(UserStatus.Enrolled);
      });
    });

    describe('異常系', () => {
      test('nameが空文字の場合、UserValidationError（必須エラー）がthrowされる', () => {
        expect(() => createUser('', 'test@example.com')).toThrow(UserValidationError);
        expect(() => createUser('', 'test@example.com')).toThrow('名前の検証に失敗しました: この項目は必須です');
      });
      test('nameが空白文字のみの場合、UserValidationError（必須エラー）がthrowされる', () => {
        expect(() => createUser('   ', 'test@example.com')).toThrow(UserValidationError);
        expect(() => createUser('   ', 'test@example.com')).toThrow('名前の検証に失敗しました: この項目は必須です');
      });

      test('emailが不正な場合、UserValidationError（無効なメールアドレスエラー）がthrowされる', () => {
        expect(() => createUser('test user', 'invalid-email')).toThrow(UserValidationError);
        expect(() => createUser('test user', 'invalid-email')).toThrow('メールアドレスの検証に失敗しました: 無効なメールアドレスです: invalid-email');
      });
    });
  });

  describe('rebuildUser', () => {
    describe('正常系', () => {
      test('有効な値でUserを再構築できる', () => {
        const user = rebuildUser('test-id', 'test user', 'test@example.com', UserStatus.Enrolled);
        expect(getUserId(user)).toBe('test-id');
        expect(getUserName(user)).toBe('test user');
        expect(getUserEmail(user)).toBe('test@example.com');
        expect(getUserStatus(user)).toBe(UserStatus.Enrolled);
      });
    });

    describe('異常系', () => {
      test('emailが不正な場合、UserValidationError（無効なメールアドレスエラー）がthrowされる', () => {
        expect(() => rebuildUser('test-id', 'test user', 'invalid-email', UserStatus.Enrolled)).toThrow(UserValidationError);
        expect(() => rebuildUser('test-id', 'test user', 'invalid-email', UserStatus.Enrolled)).toThrow('メールアドレスの検証に失敗しました: 無効なメールアドレスです: invalid-email');
      });
    });
  });
});
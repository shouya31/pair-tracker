import { User } from './User';
import { UserStatus } from './enums/UserStatus';
import { Email } from '../shared/Email';
import { EmailValidationError } from '../shared/errors/EmailValidationError';
import { UserNameValidationError } from './errors/UserNameValidationError';

describe('User', () => {
  describe('create', () => {
    test('新規作成したユーザーのステータスが「在籍中」になっている', () => {
      const name = 'テストユーザー';
      const email = 'test@example.com';
      const user = User.create(name, email);

      expect(user.getStatus()).toBe(UserStatus.Enrolled);
    });

    test('ユーザーが正しい値で作成される', () => {
      const name = 'テストユーザー';
      const email = 'test@example.com';
      const user = User.create(name, email);

      expect(user.getName()).toBe(name);
      expect(user.getEmail()).toBe(email);
      expect(user.getUserId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i); // UUID v4形式
    });

    test('無効なメールアドレスでユーザーを作成しようとするとエラーになる', () => {
      const name = 'テストユーザー';
      const invalidEmail = 'invalid-email';

      expect(() => User.create(name, invalidEmail)).toThrow(EmailValidationError);
      expect(() => User.create(name, invalidEmail)).toThrow('メールアドレスの検証に失敗しました: 無効なメールアドレスです: invalid-email');
    });

    test('メールアドレスがEmail値オブジェクトとして保持される', () => {
      const name = 'テストユーザー';
      const email = 'test@example.com';
      const user = User.create(name, email);

      expect(user.getEmailVO()).toBeInstanceOf(Email);
      expect(user.getEmailVO().getValue()).toBe(email);
    });

    test('空の名前でユーザーを作成しようとするとエラーになる', () => {
      const emptyName = '';
      const email = 'test@example.com';

      expect(() => User.create(emptyName, email)).toThrow(UserNameValidationError);
      expect(() => User.create(emptyName, email)).toThrow('名前の検証に失敗しました: 名前を入力してください');
    });

    test('スペースのみの名前でユーザーを作成しようとするとエラーになる', () => {
      const whitespaceOnlyName = '   ';
      const email = 'test@example.com';

      expect(() => User.create(whitespaceOnlyName, email)).toThrow(UserNameValidationError);
      expect(() => User.create(whitespaceOnlyName, email)).toThrow('名前の検証に失敗しました: 名前を入力してください');
    });
  });

  describe('rebuild', () => {
    const validId = '12345678-1234-4123-8123-123456789012';
    const validName = 'テストユーザー';
    const validEmail = 'test@example.com';

    test('正しい値でユーザーが再構築される', () => {
      const status = UserStatus.Enrolled;
      const user = User.rebuild(validId, validName, validEmail, status);

      expect(user.getUserId()).toBe(validId);
      expect(user.getName()).toBe(validName);
      expect(user.getEmail()).toBe(validEmail);
      expect(user.getStatus()).toBe(status);
    });

    test('無効なメールアドレスで再構築しようとするとエラーになる', () => {
      const id = validId;
      const name = validName;
      const invalidEmail = 'invalid-email';
      const status = UserStatus.Enrolled;

      expect(() => User.rebuild(id, name, invalidEmail, status)).toThrow(EmailValidationError);
      expect(() => User.rebuild(id, name, invalidEmail, status)).toThrow('メールアドレスの検証に失敗しました: 無効なメールアドレスです: invalid-email');
    });
  });
});
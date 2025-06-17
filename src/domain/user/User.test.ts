import { User } from './User';
import { UserStatus } from './enums/UserStatus';
import { Email } from '../shared/Email';

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

      expect(() => User.create(name, invalidEmail)).toThrow('無効なメールアドレスです');
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

      expect(() => User.create(emptyName, email)).toThrow('名前を入力してください');
    });

    test('スペースのみの名前でユーザーを作成しようとするとエラーになる', () => {
      const whitespaceOnlyName = '   ';
      const email = 'test@example.com';

      expect(() => User.create(whitespaceOnlyName, email)).toThrow('名前を入力してください');
    });
  });
});
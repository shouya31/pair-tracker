import { Email } from './Email';
import { UserValidationError } from '../user/errors/UserValidationError';

describe('Email', () => {
  describe('create', () => {
    test('有効なメールアドレスでEmailを作成できる', () => {
      const validEmail = 'test@example.com';
      const email = Email.create(validEmail);
      expect(email.getValue()).toBe(validEmail);
    });

    test('無効なメールアドレスでEmailを作成しようとするとエラーになる', () => {
      const invalidEmail = 'invalid-email';
      expect(() => Email.create(invalidEmail)).toThrow(UserValidationError);
      expect(() => Email.create(invalidEmail)).toThrow('メールアドレスの検証に失敗しました: 無効なメールアドレスです: invalid-email');
    });

    test('空のメールアドレスでEmailを作成しようとするとエラーになる', () => {
      expect(() => Email.create('')).toThrow(UserValidationError);
      expect(() => Email.create('')).toThrow('メールアドレスの検証に失敗しました: 無効なメールアドレスです: ');
    });

    test('nullのメールアドレスでEmailを作成しようとするとエラーになる', () => {
      expect(() => Email.create(null as unknown as string)).toThrow(UserValidationError);
      expect(() => Email.create(null as unknown as string)).toThrow('メールアドレスの検証に失敗しました: 無効なメールアドレスです: null');
    });

    test('undefinedのメールアドレスでEmailを作成しようとするとエラーになる', () => {
      expect(() => Email.create(undefined as unknown as string)).toThrow(UserValidationError);
      expect(() => Email.create(undefined as unknown as string)).toThrow('メールアドレスの検証に失敗しました: 無効なメールアドレスです: undefined');
    });

    test('ローカル部が65文字以上のメールアドレスでEmailを作成しようとするとエラーになる', () => {
      const longLocalPart = 'a'.repeat(65);
      const invalidEmail = `${longLocalPart}@example.com`;
      expect(() => Email.create(invalidEmail)).toThrow(UserValidationError);
      expect(() => Email.create(invalidEmail)).toThrow(`メールアドレスの検証に失敗しました: 無効なメールアドレスです: ${invalidEmail}`);
    });

    test('ドメイン部が256文字以上のメールアドレスでEmailを作成しようとするとエラーになる', () => {
      const longDomain = 'a'.repeat(256);
      const invalidEmail = `test@${longDomain}`;
      expect(() => Email.create(invalidEmail)).toThrow(UserValidationError);
      expect(() => Email.create(invalidEmail)).toThrow(`メールアドレスの検証に失敗しました: 無効なメールアドレスです: ${invalidEmail}`);
    });

    test('全体が255文字以上のメールアドレスでEmailを作成しようとするとエラーになる', () => {
      const longLocalPart = 'a'.repeat(64);
      const longDomain = 'a'.repeat(190);
      const invalidEmail = `${longLocalPart}@${longDomain}.com`;
      expect(() => Email.create(invalidEmail)).toThrow(UserValidationError);
      expect(() => Email.create(invalidEmail)).toThrow(`メールアドレスの検証に失敗しました: 無効なメールアドレスです: ${invalidEmail}`);
    });
  });

  describe('equals', () => {
    test('同じ値のEmail同士を比較するとtrueを返す', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    test('異なる値のEmail同士を比較するとfalseを返す', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });
}); 
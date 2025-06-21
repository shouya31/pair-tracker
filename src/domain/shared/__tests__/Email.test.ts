import { Email } from '../Email';
import { EmailValidationError } from '../errors/EmailValidationError';

describe('Email', () => {
  describe('create', () => {
    test('有効なメールアドレスでインスタンスが作成される', () => {
      const validEmails = [
        'test@example.com',
        'user.name+tag@example.co.jp',
        '1234567890@example.com',
        'email@subdomain.example.com',
        'firstname.lastname@example.com',
        'email@123.123.123.123',
        'test.email@example.com',
        'test+email@example.com'
      ];

      validEmails.forEach(email => {
        expect(() => Email.create(email)).not.toThrow();
        expect(Email.create(email).getValue()).toBe(email);
      });
    });

    test('無効なメールアドレスで作成しようとするとエラーになる', () => {
      const invalidEmails = [
        '',                    // 空文字
        'plainaddress',       // @がない
        '@example.com',       // ローカル部がない
        'email@',             // ドメイン部がない
        'email@.com',         // ドメイン部が不正
        'email@example',      // TLDがない
        'email@example..com',        // ドメインでドットが連続
        'email@-example.com',        // ドメインがハイフンで始まる
        'email@example-.com',        // ドメインがハイフンで終わる
        'a'.repeat(65) + '@example.com',  // ローカル部が64文字を超える
        'email@' + 'a'.repeat(256) + '.com',  // ドメイン部が255文字を超える
        'email@' + 'a'.repeat(255) + '.com'  // 全体で254文字を超える
      ];

      invalidEmails.forEach(email => {
        expect(() => Email.create(email)).toThrow(EmailValidationError);
      });
    });

    test('nullやundefinedで作成しようとするとエラーになる', () => {
      expect(() => Email.create(null as unknown as string)).toThrow(EmailValidationError);
      expect(() => Email.create(undefined as unknown as string)).toThrow(EmailValidationError);
    });
  });

  describe('equals', () => {
    test('同じメールアドレスを持つインスタンス同士は等価である', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    test('異なるメールアドレスを持つインスタンス同士は等価でない', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });
}); 
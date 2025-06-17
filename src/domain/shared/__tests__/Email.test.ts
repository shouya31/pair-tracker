import { Email } from '../Email';

describe('Email', () => {
  describe('正常系', () => {
    test('通常のメールアドレスが作成できる', () => {
      const email = 'test@example.com';
      const emailVO = Email.create(email);
      expect(emailVO.getValue()).toBe(email);
    });

    test('ドットを含むローカル部が許可される', () => {
      const email = 'test.user@example.com';
      expect(() => Email.create(email)).not.toThrow();
    });

    test('プラス記号を含むローカル部が許可される', () => {
      const email = 'test+user@example.com';
      expect(() => Email.create(email)).not.toThrow();
    });

    test('サブドメインを含むドメイン部が許可される', () => {
      const email = 'test@sub.example.com';
      expect(() => Email.create(email)).not.toThrow();
    });

    test('等価性の比較ができる', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');
      const email3 = Email.create('other@example.com');

      expect(email1.equals(email2)).toBe(true);
      expect(email1.equals(email3)).toBe(false);
    });
  });

  describe('異常系', () => {
    test('空文字列は無効', () => {
      expect(() => Email.create('')).toThrow('無効なメールアドレスです');
    });

    test('アットマーク(@)がない場合は無効', () => {
      expect(() => Email.create('testexample.com')).toThrow('無効なメールアドレスです');
    });

    test('ドメイン部がない場合は無効', () => {
      expect(() => Email.create('test@')).toThrow('無効なメールアドレスです');
    });

    test('ローカル部がない場合は無効', () => {
      expect(() => Email.create('@example.com')).toThrow('無効なメールアドレスです');
    });

    test('スペースを含む場合は無効', () => {
      expect(() => Email.create('test @example.com')).toThrow('無効なメールアドレスです');
    });

    test('全角文字を含む場合は無効', () => {
      expect(() => Email.create('テスト@example.com')).toThrow('無効なメールアドレスです');
    });

    test('254文字を超えるメールアドレスは無効', () => {
      const longLocalPart = 'a'.repeat(245);   // 245 + 1 (@) + 11 (example.com) = 257 > 254
      const longEmail = `${longLocalPart}@example.com`;
      expect(() => Email.create(longEmail)).toThrow('無効なメールアドレスです');
    });
  });
});
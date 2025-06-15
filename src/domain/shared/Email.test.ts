import { Email } from './Email';

describe('Email', () => {
  it('有効なメールアドレスを受け入れる', () => {
    const email = new Email('test@example.com');
    expect(email.toString()).toBe('test@example.com');
  });

  it('無効なメールアドレスを拒否する', () => {
    expect(() => new Email('invalid-email')).toThrow('Invalid email format');
    expect(() => new Email('')).toThrow('Invalid email format');
    expect(() => new Email('@example.com')).toThrow('Invalid email format');
    expect(() => new Email('test@')).toThrow('Invalid email format');
  });

  it('同じ値のEmailオブジェクトが等しいと判定される', () => {
    const email1 = new Email('test@example.com');
    const email2 = new Email('test@example.com');
    expect(email1.equals(email2)).toBe(true);
  });

  it('異なる値のEmailオブジェクトが等しくないと判定される', () => {
    const email1 = new Email('test1@example.com');
    const email2 = new Email('test2@example.com');
    expect(email1.equals(email2)).toBe(false);
  });
}); 
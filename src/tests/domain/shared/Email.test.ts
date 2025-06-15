import { Email } from '../../../domain/shared/Email';

describe('Email', () => {
  describe('create', () => {
    it('should create an email with valid format', () => {
      const email = Email.create('test@example.com');
      expect(email.getValue()).toBe('test@example.com');
    });

    it('should create an email with subdomain', () => {
      const email = Email.create('test@sub.example.com');
      expect(email.getValue()).toBe('test@sub.example.com');
    });

    it('should create an email with numbers and special characters', () => {
      const email = Email.create('test.123+alias@example.com');
      expect(email.getValue()).toBe('test.123+alias@example.com');
    });

    it('should throw error for invalid email format', () => {
      expect(() => Email.create('invalid-email'))
        .toThrow('Invalid email format');
      expect(() => Email.create('@example.com'))
        .toThrow('Invalid email format');
      expect(() => Email.create('test@'))
        .toThrow('Invalid email format');
      expect(() => Email.create('test@.com'))
        .toThrow('Invalid email format');
    });
  });

  describe('equals', () => {
    it('should return true for same email', () => {
      const email1 = Email.create('test@example.com');
      const email2 = Email.create('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('should return false for different email', () => {
      const email1 = Email.create('test1@example.com');
      const email2 = Email.create('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });
  });
}); 
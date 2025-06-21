import { EmailValidationError } from './errors/EmailValidationError';

export class Email {
  private constructor(private readonly value: string) {
    if (!Email.isValid(value)) {
      throw EmailValidationError.invalid(value);
    }
  }

  public static create(value: string): Email {
    return new Email(value);
  }

  public getValue(): string {
    return this.value;
  }

  private static isValid(email: string): boolean {
    // RFC 5322に基づく基本的なメールアドレスの正規表現
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!email || typeof email !== 'string') return false;

    // RFC 5321で定義されている最大長のチェック
    const parts = email.split('@');
    if (parts.length !== 2) return false;

    const [localPart, domain] = parts;
    if (localPart.length > 64) return false;  // ローカル部は64文字まで
    if (domain.length > 255) return false;    // ドメイン部は255文字まで
    if (email.length > 254) return false;     // 全体で254文字まで

    if (!emailRegex.test(email)) return false;

    return true;
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }
}
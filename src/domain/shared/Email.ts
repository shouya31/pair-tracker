import { UserValidationError } from '../user/errors/UserValidationError';

export type Email = {
  value: string;
};

export function createEmail(value: string): Email {
  if (!isValidEmail(value)) {
    throw UserValidationError.emailInvalid(value);
  }
  return { value };
}

export function getEmailValue(email: Email): string {
  return email.value;
}

function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;

  // RFC 5321で定義されている最大長のチェック
  const parts = email.split('@');
  if (parts.length !== 2) return false;

  const [localPart, domain] = parts;
  if (localPart.length > 64) return false;  // ローカル部は64文字まで
  if (domain.length > 255) return false;    // ドメイン部は255文字まで
  if (email.length > 254) return false;     // 全体で254文字まで

  // ローカル部のチェック
  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)) return false;
  if (/\.{2,}/.test(localPart)) return false;  // 連続したドットは不可
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;

  // ドメイン部のチェック
  const domainParts = domain.split('.');
  if (domainParts.length < 2) return false;  // 少なくとも1つのドットが必要
  if (domain.includes('..')) return false;   // 連続したドットは不可
  if (domain.startsWith('-') || domain.endsWith('-')) return false;

  // 各ドメインパートのチェック
  for (const part of domainParts) {
    if (part.length === 0) return false;
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(part)) return false;
  }

  return true;
}

export function equalsEmail(a: Email, b: Email): boolean {
  return a.value === b.value;
}
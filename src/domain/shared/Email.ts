import { Result, ok, err } from './Result';

export type Email = {
  readonly value: string;
};

export type EmailError = {
  message: string;
};

export const createEmail = (value: string): Result<Email, EmailError> => {
  if (!isNonEmptyString(value)) {
    return err({
      message: 'メールアドレスの入力が必須です'
    });
  }

  if (!isValidStructure(value)) {
    return err({
      message: `無効なメールアドレスの形式です: ${value}`
    });
  }

  const [localPart, domain] = value.split('@');

  if (!isValidLocalPart(localPart)) {
    return err({
      message: `無効なローカルパートです: ${localPart}`
    });
  }

  if (!isValidDomain(domain)) {
    return err({
      message: `無効なドメインです: ${domain}`
    });
  }

  return ok({ value });
};

export const getEmailValue = (email: Email): string => email.value;

export const equalsEmail = (a: Email, b: Email): boolean => a.value === b.value;

function isNonEmptyString(email: string): boolean {
  return !!email && typeof email === 'string';
}

function isValidStructure(email: string): boolean {
  const parts = email.split('@');
  if (parts.length !== 2) return false;
  const [localPart, domain] = parts;
  if (localPart.length > 64) return false;
  if (domain.length > 255) return false;
  if (email.length > 254) return false;
  return true;
}

function isValidLocalPart(localPart: string): boolean {
  if (!/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+$/.test(localPart)) return false;
  if (/\.{2,}/.test(localPart)) return false;
  if (localPart.startsWith('.') || localPart.endsWith('.')) return false;
  return true;
}

function isValidDomain(domain: string): boolean {
  const domainParts = domain.split('.');
  if (domainParts.length < 2) return false;
  if (domain.includes('..')) return false;
  if (domain.startsWith('-') || domain.endsWith('-')) return false;
  for (const part of domainParts) {
    if (part.length === 0) return false;
    if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/.test(part)) return false;
  }
  return true;
}

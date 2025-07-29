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

export function equalsEmail(a: Email, b: Email): boolean {
  return a.value === b.value;
}

function isValidEmail(email: string): boolean {
  if (!isNonEmptyString(email)) return false;
  if (!isValidStructure(email)) return false;

  const [localPart, domain] = email.split('@');
  if (!isValidLocalPart(localPart)) return false;
  if (!isValidDomain(domain)) return false;

  return true;
}

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

export type DomainError = {
  message: string;
  code: string;
};

export const createDomainError = (message: string, code: string = 'VALIDATION_ERROR'): DomainError => ({
  message,
  code,
});

// エラーコードの定数
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  NOT_FOUND: 'NOT_FOUND',
  SYSTEM_ERROR: 'SYSTEM_ERROR',
} as const;

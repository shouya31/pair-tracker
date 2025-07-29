export type DomainError = {
  message: string;
};

export function createDomainError(message: string): DomainError {
  return { message };
}

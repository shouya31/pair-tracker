export type DomainError = {
  message: string;
};

export const createDomainError = (message: string): DomainError => ({
  message,
});

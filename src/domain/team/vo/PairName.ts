import { PairNameValidationError } from '../errors/PairNameValidationError';

export class PairName {
  private readonly value: string;

  constructor(value: string) {
    this.validatePairName(value);
    this.value = value;
  }

  private validatePairName(value: string): void {
    if (value.length !== 1) {
      throw PairNameValidationError.lengthError();
    }

    if (!/^[A-Z]$/.test(value)) {
      throw PairNameValidationError.formatError();
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: PairName): boolean {
    return this.value === other.value;
  }
}
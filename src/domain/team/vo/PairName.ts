import { PairValidationError } from '../errors/PairValidationError';

export class PairName {
  private readonly value: string;

  constructor(value: string) {
    this.validatePairName(value);
    this.value = value;
  }

  private validatePairName(value: string): void {
    if (value.length !== 1) {
      throw PairValidationError.nameLength(value);
    }

    if (!/^[A-Z]$/.test(value)) {
      throw PairValidationError.nameFormat(value);
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: PairName): boolean {
    return this.value === other.value;
  }
}
export class PairLabel {
  constructor(public readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value) {
      throw new Error('Pair label must be a single character from A to Z');
    }
    if (!this.isValidLabel(value)) {
      throw new Error('Pair label must be a single character from A to Z');
    }
  }

  private isValidLabel(label: string): boolean {
    return /^[A-Z]$/.test(label);
  }

  equals(other: PairLabel): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
} 
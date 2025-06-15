export class PairLabel {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  static create(value: string): PairLabel {
    return new PairLabel(value.toUpperCase());
  }

  private validate(value: string): void {
    if (!value.match(/^[A-Z]$/)) {
      throw new Error('Pair label must be a single uppercase letter A-Z');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PairLabel): boolean {
    return this.value === other.value;
  }
} 
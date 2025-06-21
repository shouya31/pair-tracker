export class PairName {
  private readonly value: string;

  constructor(value: string) {
    this.validatePairName(value);
    this.value = value;
  }

  private validatePairName(value: string): void {
    if (value.length !== 1) {
      throw new Error('ペア名は1文字である必要があります');
    }

    if (!/^[A-Z]$/.test(value)) {
      throw new Error('ペア名は大文字のアルファベット1文字である必要があります');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: PairName): boolean {
    return this.value === other.value;
  }
}
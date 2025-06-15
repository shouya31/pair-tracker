export class IssueTitle {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  static create(value: string): IssueTitle {
    return new IssueTitle(value);
  }

  private validate(value: string): void {
    if (!value || value.length < 1 || value.length > 20) {
      throw new Error('Issue title must be between 1 and 20 characters');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: IssueTitle): boolean {
    return this.value === other.value;
  }
} 
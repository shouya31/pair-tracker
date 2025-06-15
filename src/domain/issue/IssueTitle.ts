export class IssueTitle {
  private readonly value: string;

  constructor(value: string) {
    if (!this.isValid(value)) {
      throw new Error('Issue title must be 1-20 characters');
    }
    this.value = value;
  }

  private isValid(title: string): boolean {
    return title.length > 0 && title.length <= 20;
  }

  toString(): string {
    return this.value;
  }

  equals(other: IssueTitle): boolean {
    return this.value === other.value;
  }
} 
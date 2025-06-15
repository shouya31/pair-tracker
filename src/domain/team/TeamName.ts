export class TeamName {
  constructor(public readonly value: string) {
    this.validate(value);
  }

  private validate(value: string): void {
    if (!value) {
      throw new Error('Team name must be 1-3 characters');
    }
    if (value.length > 3) {
      throw new Error('Team name must be 1-3 characters');
    }
  }

  equals(other: TeamName): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
} 
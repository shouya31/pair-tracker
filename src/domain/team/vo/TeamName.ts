export class TeamName {
  private constructor(private readonly value: string) {
    this.validate(value);
  }

  static create(value: string): TeamName {
    return new TeamName(value);
  }

  private validate(value: string): void {
    if (!value || value.length > 3) {
      throw new Error('Team name must be between 1 and 3 characters');
    }
  }

  getValue(): string {
    return this.value;
  }

  equals(other: TeamName): boolean {
    return this.value === other.value;
  }
} 
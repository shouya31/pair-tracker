import { TeamValidationError } from '../errors/TeamValidationError';

export class TeamName {
  private readonly value: string;

  public static create(value: string): TeamName {
    if (!value) {
      throw TeamValidationError.teamNameRequired();
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) {
      throw TeamValidationError.teamNameRequired();
    }

    if (trimmedValue.length > 3) {
      throw TeamValidationError.teamNameTooLong(trimmedValue);
    }

    return new TeamName(trimmedValue);
  }

  private constructor(value: string) {
    this.value = value;
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: TeamName): boolean {
    return this.value === other.value;
  }
}
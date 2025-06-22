import { TeamNameLengthError, TeamNameRequiredError } from '../errors/TeamValidationError';

export class TeamName {
  private readonly value: string;

  public static create(value: string): TeamName {
    if (!value) {
      throw new TeamNameRequiredError();
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) {
      throw new TeamNameRequiredError();
    }

    if (trimmedValue.length > 3) {
      throw new TeamNameLengthError(trimmedValue);
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
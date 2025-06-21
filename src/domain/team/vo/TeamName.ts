import { TeamNameLengthError, TeamNameRequiredError } from '../errors/TeamValidationError';

export class TeamName {
  private readonly value: string;

  constructor(value: string) {
    this.validateTeamName(value);
    this.value = value.trim();
  }

  private validateTeamName(value: string): void {
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
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: TeamName): boolean {
    return this.value === other.value;
  }
}
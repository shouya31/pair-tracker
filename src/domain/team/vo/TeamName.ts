export class TeamName {
  private readonly value: string;

  constructor(value: string) {
    this.validateTeamName(value);
    this.value = value.trim();
  }

  private validateTeamName(value: string): void {
    if (!value) {
      throw new Error('チーム名は必須です');
    }

    const trimmedValue = value.trim();
    if (!trimmedValue) {
      throw new Error('チーム名は必須です');
    }

    if (trimmedValue.length > 3) {
      throw new Error('チーム名は3文字以下である必要があります');
    }
  }

  public getValue(): string {
    return this.value;
  }

  public equals(other: TeamName): boolean {
    return this.value === other.value;
  }
}
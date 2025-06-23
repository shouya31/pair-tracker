import { ValidationError } from '../../shared/errors/ValidationError';

export class TeamValidationError extends ValidationError {
  // Team Name Validation
  static teamNameRequired(): TeamValidationError {
    return new TeamValidationError(
      'この項目は必須です',
      'チーム名'
    );
  }

  static teamNameTooLong(value: string): TeamValidationError {
    return new TeamValidationError(
      `3文字以下で入力してください（現在: ${value.length}文字）`,
      'チーム名',
      value
    );
  }

  // Team ID Validation
  static teamIdRequired(): TeamValidationError {
    return new TeamValidationError(
      'この項目は必須です',
      'チームID'
    );
  }

  static teamIdInvalidFormat(value: string): TeamValidationError {
    return new TeamValidationError(
      'UUID形式である必要があります',
      'チームID',
      value
    );
  }
}

export const TeamIdRequiredError = TeamValidationError.teamIdRequired;
export const TeamIdFormatError = (value: string) => TeamValidationError.teamIdInvalidFormat(value);
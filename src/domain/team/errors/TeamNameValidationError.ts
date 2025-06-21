import { ValidationError } from '../../shared/errors/ValidationError';

export class TeamNameValidationError extends ValidationError {
  static required(): TeamNameValidationError {
    return new TeamNameValidationError('チーム名は必須です', 'チーム名', undefined);
  }

  static tooLong(): TeamNameValidationError {
    return new TeamNameValidationError('チーム名は3文字以下である必要があります', 'チーム名', undefined);
  }
} 
import { ApplicationError } from '../../shared/ApplicationError';

export class DuplicateTeamNameError extends ApplicationError {
  constructor(teamName: string) {
    super(`チーム名 "${teamName}" は既に使用されています`);
    Object.setPrototypeOf(this, DuplicateTeamNameError.prototype);
  }
}

export class UserNotFoundError extends ApplicationError {
  constructor(userId: string) {
    super(`ユーザーID "${userId}" が見つかりません`);
    Object.setPrototypeOf(this, UserNotFoundError.prototype);
  }
} 
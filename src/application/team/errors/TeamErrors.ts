import { ApplicationError } from '../../shared/ApplicationError';

export class DuplicateTeamNameError extends ApplicationError {
  constructor(teamName: string) {
    super(`チーム名 "${teamName}" は既に使用されています`);
    Object.setPrototypeOf(this, DuplicateTeamNameError.prototype);
  }
}

export class UserNotFoundError extends Error {
  constructor(userId: string) {
    super(`User not found: ${userId}`);
    this.name = 'UserNotFoundError';
  }
}

export class TeamNotFoundError extends Error {
  constructor(teamId: string) {
    super(`Team not found: ${teamId}`);
    this.name = 'TeamNotFoundError';
  }
} 
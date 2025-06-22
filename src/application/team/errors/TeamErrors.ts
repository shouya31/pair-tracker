import { ApplicationError } from '../../shared/ApplicationError';

export class DuplicateTeamNameError extends ApplicationError {
  constructor(teamName: string) {
    super(`チーム名「${teamName}」は既に使用されています。`);
    this.name = 'DuplicateTeamNameError';
  }
}

export class UserNotFoundError extends ApplicationError {
  constructor(userId: string) {
    super(`ユーザーが見つかりません。ユーザーID: ${userId}`);
    this.name = 'UserNotFoundError';
  }
}

export class InvalidUserStatusError extends ApplicationError {
  constructor(userName: string, status: string) {
    super(`在籍中でないメンバーはチームに所属できません: ${userName}(${status})`);
    this.name = 'InvalidUserStatusError';
  }
}

export class TeamNotFoundError extends ApplicationError {
  constructor(teamId: string) {
    super(`チームが見つかりません。チームID: ${teamId}`);
    this.name = 'TeamNotFoundError';
  }
} 
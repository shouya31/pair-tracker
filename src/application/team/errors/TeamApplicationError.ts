import { ApplicationError } from '../../shared/ApplicationError';

export class TeamApplicationError extends ApplicationError {
  protected constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }

  public static userNotFound(userId: string): TeamApplicationError {
    return new TeamApplicationError(
      `ユーザーが見つかりません。ユーザーID: ${userId}`
    );
  }

  public static invalidUserStatus(userName: string, status: string): TeamApplicationError {
    return new TeamApplicationError(
      `在籍中でないメンバーはチームに所属できません: ${userName}(${status})`
    );
  }

  public static teamNotFound(teamId: string): TeamApplicationError {
    return new TeamApplicationError(
      `チームが見つかりません。チームID: ${teamId}`
    );
  }
}
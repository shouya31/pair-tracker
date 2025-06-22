import { DomainError } from '../../shared/DomainError';

export class TeamDomainError extends DomainError {
  public static memberCountError(count: number): TeamDomainError {
    return new TeamDomainError(`チームには最低3名のメンバーが必要です。現在のメンバー数: ${count}`);
  }

  public static memberStatusError(invalidMembers: string[]): TeamDomainError {
    return new TeamDomainError(`在籍中でないメンバーはチームに所属できません: ${invalidMembers.join(', ')}`);
  }

  public static duplicateMemberError(): TeamDomainError {
    return new TeamDomainError('同じメンバーを複数回追加することはできません。');
  }

  public static invalidPairMemberCount(count: number): TeamDomainError {
    return new TeamDomainError(
      `ペアは2名または3名で構成する必要があります（現在: ${count}名）`
    );
  }

  public static nonTeamMemberError(memberNames: string[]): TeamDomainError {
    return new TeamDomainError(
      `以下のメンバーはチームに所属していません：${memberNames.join(', ')}`
    );
  }

  public static duplicatePairMemberError(memberNames: string[]): TeamDomainError {
    return new TeamDomainError(
      `以下のメンバーは既に他のペアに所属しています：${memberNames.join(', ')}`
    );
  }
}
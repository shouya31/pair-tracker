import { DomainError } from '../../shared/DomainError';

export class TeamDomainError extends DomainError {
  public static memberCountError(count: number): TeamDomainError {
    return new TeamDomainError(`チームには最低3名のメンバーが必要です。現在のメンバー数: ${count}`);
  }

  public static memberStatusError(invalidMembers: string[]): TeamDomainError {
    return new TeamDomainError(`在籍中でないメンバーはチームに所属できません: ${invalidMembers.join(', ')}`);
  }

  public static duplicateMemberError(): TeamDomainError {
    return new TeamDomainError('同じメンバーを複数回指定することはできません');
  }

  public static invalidPairMemberCount(): TeamDomainError {
    return new TeamDomainError('ペアのメンバー数は2人または3人である必要があります');
  }

  public static nonTeamMemberError(memberIds: string[]): TeamDomainError {
    return new TeamDomainError(`以下のメンバーはチームに所属していません: ${memberIds.join(', ')}`);
  }

  public static duplicatePairMemberError(memberNames: string[]): TeamDomainError {
    return new TeamDomainError(`以下のメンバーは既に他のペアに所属しています: ${memberNames.join(', ')}`);
  }

  public static noPendingPairFormationError(): TeamDomainError {
    return new TeamDomainError('ペア形成リクエストが存在しません');
  }

  public static pairFormationMismatchError(): TeamDomainError {
    return new TeamDomainError('承認されたメンバーが、リクエストされたメンバーと一致しません');
  }
}
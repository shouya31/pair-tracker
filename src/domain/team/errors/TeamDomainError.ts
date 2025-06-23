import { DomainError } from '../../shared/DomainError';

export type TeamDomainErrorType =
  | 'MEMBER_COUNT'
  | 'MEMBER_STATUS'
  | 'DUPLICATE_MEMBER'
  | 'INVALID_PAIR_MEMBER_COUNT'
  | 'NON_TEAM_MEMBER'
  | 'DUPLICATE_PAIR_MEMBER'
  | 'NO_PENDING_PAIR_FORMATION'
  | 'PAIR_FORMATION_MISMATCH'
  | 'DUPLICATE_TEAM_NAME';

export class TeamDomainError extends DomainError {
  constructor(
    message: string,
    private readonly _type: TeamDomainErrorType
  ) {
    super(message);
  }

  get type(): TeamDomainErrorType {
    return this._type;
  }

  public static memberCountError(count: number): TeamDomainError {
    return new TeamDomainError(
      `チームには最低3名のメンバーが必要です。現在のメンバー数: ${count}`,
      'MEMBER_COUNT'
    );
  }

  public static memberStatusError(invalidMembers: string[]): TeamDomainError {
    return new TeamDomainError(
      `在籍中でないメンバーはチームに所属できません: ${invalidMembers.join(', ')}`,
      'MEMBER_STATUS'
    );
  }

  public static duplicateMemberError(): TeamDomainError {
    return new TeamDomainError(
      '同じメンバーを複数回指定することはできません',
      'DUPLICATE_MEMBER'
    );
  }

  public static invalidPairMemberCount(): TeamDomainError {
    return new TeamDomainError(
      'ペアのメンバー数は2人または3人である必要があります',
      'INVALID_PAIR_MEMBER_COUNT'
    );
  }

  public static nonTeamMemberError(memberIds: string[]): TeamDomainError {
    return new TeamDomainError(
      `以下のメンバーはチームに所属していません: ${memberIds.join(', ')}`,
      'NON_TEAM_MEMBER'
    );
  }

  public static duplicatePairMemberError(memberNames: string[]): TeamDomainError {
    return new TeamDomainError(
      `以下のメンバーは既に他のペアに所属しています: ${memberNames.join(', ')}`,
      'DUPLICATE_PAIR_MEMBER'
    );
  }

  public static noPendingPairFormationError(): TeamDomainError {
    return new TeamDomainError(
      'ペア形成リクエストが存在しません',
      'NO_PENDING_PAIR_FORMATION'
    );
  }

  public static pairFormationMismatchError(): TeamDomainError {
    return new TeamDomainError(
      '承認されたメンバーが、リクエストされたメンバーと一致しません',
      'PAIR_FORMATION_MISMATCH'
    );
  }

  public static duplicateTeamNameError(name: string): TeamDomainError {
    return new TeamDomainError(
      `このチーム名は既に使用されています: ${name}`,
      'DUPLICATE_TEAM_NAME'
    );
  }
}
import { DomainError } from '../../shared/DomainError';

export class PairDomainError extends DomainError {
  static invalidMemberCount(): PairDomainError {
    return new PairDomainError('ペアのメンバー数は2人または3人である必要があります');
  }

  static memberNotInTeam(memberIds: string[]): PairDomainError {
    return new PairDomainError(`以下のメンバーはチームに所属していません: ${memberIds.join(', ')}`);
  }

  static duplicateMember(): PairDomainError {
    return new PairDomainError('同じメンバーを複数回指定することはできません');
  }

  static alreadyInOtherPair(memberNames: string[]): PairDomainError {
    return new PairDomainError(`以下のメンバーは既に他のペアに所属しています: ${memberNames.join(', ')}`);
  }

  static noPendingFormation(): PairDomainError {
    return new PairDomainError('ペア形成リクエストが存在しません');
  }

  static formationMismatch(): PairDomainError {
    return new PairDomainError('承認されたメンバーが、リクエストされたメンバーと一致しません');
  }
} 
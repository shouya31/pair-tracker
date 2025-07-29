import { DomainError, createDomainError } from '../../shared/DomainError';

export function memberCountError(count: number): DomainError {
  return createDomainError(`チームには最低3名のメンバーが必要です。現在のメンバー数: ${count}`);
}

export function memberStatusError(invalidMembers: string[]): DomainError {
  return createDomainError(`在籍中でないメンバーはチームに所属できません: ${invalidMembers.join(', ')}`);
}

export function duplicateMemberError(): DomainError {
  return createDomainError('同じメンバーを複数回指定することはできません');
}

export function invalidPairMemberCount(): DomainError {
  return createDomainError('ペアのメンバー数は2人または3人である必要があります');
}

export function nonTeamMemberError(memberIds: string[]): DomainError {
  return createDomainError(`以下のメンバーはチームに所属していません: ${memberIds.join(', ')}`);
}

export function duplicatePairMemberError(memberNames: string[]): DomainError {
  return createDomainError(`以下のメンバーは既に他のペアに所属しています: ${memberNames.join(', ')}`);
}

export function noPendingPairFormationError(): DomainError {
  return createDomainError('ペア形成リクエストが存在しません');
}

export function pairFormationMismatchError(): DomainError {
  return createDomainError('承認されたメンバーが、リクエストされたメンバーと一致しません');
}

export function duplicateTeamNameError(name: string): DomainError {
  return createDomainError(`このチーム名は既に使用されています: ${name}`);
}
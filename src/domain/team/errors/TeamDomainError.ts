import { DomainError } from '../../shared/DomainError';
import { User } from '../../user/User';

export class TeamDomainError extends DomainError {
  constructor(message: string) {
    super(message);
  }

  static memberCountError(count: number): TeamDomainError {
    return new TeamDomainError(`チームは3名以上のメンバーが必要です（現在: ${count}名）`);
  }

  static memberStatusError(nonEnrolledMembers: User[]): TeamDomainError {
    const nonEnrolledDetails = nonEnrolledMembers
      .map(member => `${member.getName()}(${member.getStatus()})`)
      .join(', ');
    return new TeamDomainError(
      `チームメンバーは全員が在籍中である必要があります。以下のメンバーが在籍中ではありません：${nonEnrolledDetails}`
    );
  }

  static invalidPairMemberCount(count: number): TeamDomainError {
    return new TeamDomainError(`ペアは2名または3名で構成する必要があります（現在: ${count}名）`);
  }

  static nonTeamMemberError(memberNames: string[]): TeamDomainError {
    return new TeamDomainError(`以下のメンバーはチームに所属していません：${memberNames.join(', ')}`);
  }
} 
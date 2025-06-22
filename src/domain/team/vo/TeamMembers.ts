import { TeamDomainError } from '../errors/TeamDomainError';
import { TeamMember } from '../Team';

export class TeamMembers {
  private constructor(private readonly members: TeamMember[]) {}

  public static create(members: TeamMember[]): TeamMembers {
    TeamMembers.validateMembers(members);
    return new TeamMembers(members);
  }

  private static validateMembers(members: TeamMember[]): void {
    if (members.length < 3) {
      throw TeamDomainError.memberCountError(members.length);
    }

    const uniqueIds = new Set(members.map(m => m.id));
    if (uniqueIds.size !== members.length) {
      throw TeamDomainError.duplicateMemberError();
    }
  }

  public getMembers(): TeamMember[] {
    return [...this.members];
  }

  public getMemberIds(): string[] {
    return this.members.map(member => member.id);
  }

  public contains(memberId: string): boolean {
    return this.members.some(member => member.id === memberId);
  }

  public getMemberById(memberId: string): TeamMember | undefined {
    return this.members.find(member => member.id === memberId);
  }

  public count(): number {
    return this.members.length;
  }
}
import { randomUUID } from 'crypto';
import { TeamName } from './vo/TeamName';
import { User } from '../user/User';
import { UserStatus } from '../user/enums/UserStatus';
import { Pair } from './Pair';
import { PairName } from './vo/PairName';
import { TeamDomainError } from './errors/TeamDomainError';
import { TeamIdRequiredError, TeamIdFormatError } from './errors/TeamValidationError';

export class Team {
  private readonly pairs: Pair[] = [];

  private constructor(
    private readonly teamId: string,
    private readonly name: TeamName,
    private readonly members: User[],
  ) {
    this.teamId = teamId;
    this.name = name;
    this.members = [...members];
  }

  public static create(name: TeamName, members: User[]): Team {
    Team.validateMembers(members);
    return new Team(randomUUID(), name, members);
  }

  private static validateMembers(members: User[]): void {
    if (members.length < 3) {
      throw TeamDomainError.memberCountError(members.length);
    }

    const nonEnrolledMembers = members.filter(
      member => member.getStatus() !== UserStatus.Enrolled
    );

    if (nonEnrolledMembers.length > 0) {
      throw TeamDomainError.memberStatusError(nonEnrolledMembers);
    }
  }

  private static validateTeamId(teamId: string): void {
    if (!teamId) {
      throw new TeamIdRequiredError();
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(teamId)) {
      throw new TeamIdFormatError(teamId);
    }
  }

  public getTeamId(): string {
    return this.teamId;
  }

  public getName(): string {
    return this.name.getValue();
  }

  public getNameVO(): TeamName {
    return this.name;
  }

  public getMembers(): User[] {
    return [...this.members];
  }

  public static rebuild(teamId: string, name: TeamName, members: User[]): Team {
    Team.validateTeamId(teamId);
    Team.validateMembers(members);
    return new Team(teamId, name, members);
  }

  public formPair(membersToPair: User[], pairName: PairName): void {
    this.validatePairFormation(membersToPair);
    const pair = new Pair(pairName, membersToPair);
    this.pairs.push(pair);
  }

  private validatePairFormation(membersToPair: User[]): void {
    if (membersToPair.length < 2 || membersToPair.length > 3) {
      throw TeamDomainError.invalidPairMemberCount(membersToPair.length);
    }

    const nonTeamMembers = membersToPair.filter(
      member => !this.members.some(teamMember => teamMember.equals(member))
    );

    if (nonTeamMembers.length > 0) {
      const nonTeamMemberNames = nonTeamMembers.map(member => member.getName());
      throw TeamDomainError.nonTeamMemberError(nonTeamMemberNames);
    }
  }

  public getPairs(): Pair[] {
    return [...this.pairs];
  }
}
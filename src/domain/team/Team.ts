import { randomUUID } from 'crypto';
import { TeamName } from './vo/TeamName';
import { Pair } from './Pair';
import { PairName } from './vo/PairName';
import { TeamDomainError } from './errors/TeamDomainError';
import { TeamIdRequiredError, TeamIdFormatError } from './errors/TeamValidationError';
import { AggregateRoot } from '../shared/AggregateRoot';
import { TeamMembers } from './vo/TeamMembers';
import { TeamCreated } from './events/TeamCreated';
import { PairFormed } from './events/PairFormed';
import { PairFormationRequested } from './events/PairFormationRequested';

export type TeamMember = {
  id: string;
  name?: string;
};

export class Team extends AggregateRoot {
  private readonly pairs: Pair[] = [];
  private pendingPairFormation: { memberIds: string[], pairName: PairName } | null = null;

  private constructor(
    private readonly teamId: string,
    private readonly name: TeamName,
    private readonly members: TeamMembers,
  ) {
    super();
  }

  public static create(name: TeamName, members: TeamMember[]): Team {
    const teamMembers = TeamMembers.create(members);
    const teamId = randomUUID();
    const team = new Team(teamId, name, teamMembers);

    team.addDomainEvent(new TeamCreated(
      teamId,
      name.getValue(),
      teamMembers.getMemberIds()
    ));

    return team;
  }

  public requestPairFormation(memberIds: string[], pairName: PairName): void {
    this.validatePairMembersExist(memberIds);
    this.validatePairMemberCount(memberIds);
    this.validateNoDuplicateMembers(memberIds);
    this.pendingPairFormation = { memberIds, pairName };
    this.addDomainEvent(new PairFormationRequested(
      this.teamId,
      memberIds
    ));
  }

  public confirmPairFormation(approvedMemberIds: string[]): void {
    if (!this.pendingPairFormation) {
      throw TeamDomainError.noPendingPairFormationError();
    }

    const { memberIds, pairName } = this.pendingPairFormation;

    if (!this.areArraysEqual(memberIds, approvedMemberIds)) {
      throw TeamDomainError.pairFormationMismatchError();
    }

    const pair = new Pair(pairName, memberIds);
    this.pairs.push(pair);

    this.addDomainEvent(new PairFormed(
      this.teamId,
      pairName.getValue(),
      memberIds
    ));

    this.pendingPairFormation = null;
  }

  private areArraysEqual(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;
    const sorted1 = [...arr1].sort();
    const sorted2 = [...arr2].sort();
    return sorted1.every((value, index) => value === sorted2[index]);
  }

  private validatePairMembersExist(memberIds: string[]): void {
    const notTeamMembers = memberIds.filter(id => !this.members.contains(id));
    if (notTeamMembers.length > 0) {
      throw TeamDomainError.nonTeamMemberError(notTeamMembers);
    }
  }

  private validatePairMemberCount(memberIds: string[]): void {
    if (memberIds.length < 2 || memberIds.length > 3) {
      throw TeamDomainError.invalidPairMemberCount();
    }
  }

  private validateNoDuplicateMembers(memberIds: string[]): void {
    const uniqueMembers = new Set(memberIds);
    if (uniqueMembers.size !== memberIds.length) {
      throw TeamDomainError.duplicateMemberError();
    }
  }

  // TODO： Value Objectとして、TeamIdを定義する。
  //  IDのフォーマット検証は、「Teamという概念」の責務というよりは、「TeamのIDという概念」の責務です。
  private static validateTeamId(teamId: string): void {
    if (!teamId) {
      throw TeamIdRequiredError();
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(teamId)) {
      throw TeamIdFormatError(teamId);
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

  public getMembers(): TeamMember[] {
    return this.members.getMembers();
  }

  public getMemberIds(): string[] {
    return this.members.getMemberIds();
  }

  public static rebuild(teamId: string, name: TeamName, members: TeamMember[]): Team {
    Team.validateTeamId(teamId);
    const teamMembers = TeamMembers.create(members);
    return new Team(teamId, name, teamMembers);
  }

  public getPairs(): Pair[] {
    return [...this.pairs];
  }
}
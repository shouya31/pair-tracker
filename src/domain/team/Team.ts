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

export type TeamMember = {
  id: string;
  name?: string;
};

export class Team extends AggregateRoot {
  private readonly pairs: Pair[] = [];

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

  // TODO： Value Objectとして、TeamIdを定義する。
  //  IDのフォーマット検証は、「Teamという概念」の責務というよりは、「TeamのIDという概念」の責務です。
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

  public formPair(memberIds: string[], pairName: PairName): void {
    this.validatePairFormation(memberIds);
    const pair = new Pair(pairName, memberIds);
    this.pairs.push(pair);

    this.addDomainEvent(new PairFormed(
      this.teamId,
      pairName.getValue(),
      memberIds
    ));
  }

  private validatePairFormation(memberIds: string[]): void {
    // メンバーがチームに所属しているか確認
    const notTeamMembers = memberIds.filter(id => !this.members.contains(id));
    if (notTeamMembers.length > 0) {
      throw new TeamDomainError(`以下のメンバーはチームに所属していません: ${notTeamMembers.join(', ')}`);
    }

    // ペアのメンバー数を確認
    if (memberIds.length < 2 || memberIds.length > 3) {
      throw new TeamDomainError('ペアのメンバー数は2人または3人である必要があります');
    }

    // メンバーの重複を確認
    const uniqueMembers = new Set(memberIds);
    if (uniqueMembers.size !== memberIds.length) {
      throw new TeamDomainError('同じメンバーを複数回指定することはできません');
    }
  }

  public getPairs(): Pair[] {
    return [...this.pairs];
  }
}
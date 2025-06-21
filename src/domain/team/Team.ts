import { randomUUID } from 'crypto';
import { TeamName } from './vo/TeamName';
import { User } from '../user/User';
import { UserStatus } from '../user/enums/UserStatus';
import { Pair } from './Pair';
import { PairName } from './vo/PairName';

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
      throw new Error('チームは3名以上のメンバーが必要です');
    }

    const nonEnrolledMembers = members.filter(
      member => member.getStatus() !== UserStatus.Enrolled
    );

    if (nonEnrolledMembers.length > 0) {
      const nonEnrolledDetails = nonEnrolledMembers
        .map(member => `${member.getName()}(${member.getStatus()})`)
        .join(', ');

      throw new Error(`チームメンバーは全員が在籍中である必要があります。以下のメンバーが在籍中ではありません：${nonEnrolledDetails}`);
    }
  }

  private static validateTeamId(teamId: string): void {
    if (!teamId) {
      throw new Error('チームIDは必須です');
    }
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(teamId)) {
      throw new Error('チームIDは有効なUUID形式である必要があります');
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
    // メンバー数の検証
    if (membersToPair.length < 2 || membersToPair.length > 3) {
      throw new Error('ペアは2名または3名で構成する必要があります');
    }

    // チームメンバーに含まれているか検証
    const nonTeamMembers = membersToPair.filter(
      member => !this.members.some(teamMember => teamMember.equals(member))
    );

    if (nonTeamMembers.length > 0) {
      const nonTeamMemberNames = nonTeamMembers
        .map(member => member.getName())
        .join(', ');
      throw new Error(`以下のメンバーはチームに所属していません：${nonTeamMemberNames}`);
    }
  }

  public getPairs(): Pair[] {
    return [...this.pairs];
  }
}
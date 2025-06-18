import { randomUUID } from 'crypto';
import { TeamName } from './vo/TeamName';
import { User } from '../user/User';
import { UserStatus } from '../user/enums/UserStatus';

export class Team {
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
    Team.validateMembers(members);
    return new Team(teamId, name, members);
  }
}
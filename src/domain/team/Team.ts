import { Entity } from '../shared/Entity';
import { TeamName } from './vo/TeamName';
import { User } from '../user/User';
import { Pair } from './Pair';
import { PairLabel } from './vo/PairLabel';

export class Team extends Entity {
  private constructor(
    id: string,
    private name: TeamName,
    private members: User[] = [],
    private pairs: Pair[] = [],
  ) {
    super(id);
    this.validateMembers();
  }

  static create(name: TeamName, initialMembers: User[]): Team {
    const team = new Team(crypto.randomUUID(), name, initialMembers);
    team.validateMembers();
    return team;
  }

  static reconstruct(
    id: string,
    name: TeamName,
    members: User[],
    pairs: { id: string; label: PairLabel; members: User[] }[],
  ): Team {
    const team = new Team(id, name, members);
    pairs.forEach((p) => {
      const pair = Pair.reconstruct(p.id, p.label, p.members);
      team.pairs.push(pair);
    });
    return team;
  }

  getName(): TeamName {
    return this.name;
  }

  getMembers(): User[] {
    return [...this.members];
  }

  getPairs(): Pair[] {
    return [...this.pairs];
  }

  addMember(user: User): void {
    if (!user.isEnrolled()) {
      throw new Error('Only enrolled users can be added to a team');
    }
    if (this.members.some((m) => m.equals(user))) {
      throw new Error('User is already a member of this team');
    }
    this.members.push(user);
    this.validateMembers();
  }

  removeMember(user: User): void {
    if (this.pairs.some((p) => p.getMembers().some((m) => m.equals(user)))) {
      throw new Error('Cannot remove user who belongs to a pair');
    }
    this.members = this.members.filter((m) => !m.equals(user));
    this.validateMembers();
  }

  addPair(pair: Pair): void {
    if (this.pairs.some((p) => p.equals(pair))) {
      throw new Error('Pair is already added to this team');
    }
    if (this.pairs.some((p) => p.getLabel().getValue() === pair.getLabel().getValue())) {
      throw new Error('Pair with this label already exists in the team');
    }
    this.pairs.push(pair);
  }

  removePair(pair: Pair): void {
    const index = this.pairs.findIndex((p) => p.equals(pair));
    if (index === -1) {
      throw new Error('Pair is not in this team');
    }
    this.pairs.splice(index, 1);
  }

  private validateMembers(): void {
    if (this.members.length < 3) {
      throw new Error('Team must have at least 3 members');
    }
  }
} 
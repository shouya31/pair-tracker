import { TeamName } from './TeamName';
import { Pair } from './Pair';
import { User, UserStatus } from '../user/User';

export class Team {
  private readonly _teamId: string;
  private readonly _name: TeamName;
  private readonly _members: User[];
  private readonly _pairs: Pair[];

  constructor(name: TeamName, members: User[]) {
    if (!this.isValidMemberCount(members)) {
      throw new Error('Team must have at least 3 members');
    }
    if (!this.areAllMembersActive(members)) {
      throw new Error('All team members must be active');
    }

    this._teamId = crypto.randomUUID();
    this._name = name;
    this._members = members;
    this._pairs = [];
  }

  private isValidMemberCount(members: User[]): boolean {
    return members.length >= 3;
  }

  private areAllMembersActive(members: User[]): boolean {
    return members.every(member => member.status === UserStatus.Enrolled);
  }

  get teamId(): string {
    return this._teamId;
  }

  get name(): TeamName {
    return this._name;
  }

  get members(): User[] {
    return [...this._members];
  }

  get pairs(): Pair[] {
    return [...this._pairs];
  }

  hasMember(userId: string): boolean {
    return this._members.some(member => member.userId === userId);
  }

  addPair(pair: Pair): void {
    if (!pair.members.every(member => this.hasMember(member.userId))) {
      throw new Error('All pair members must belong to the team');
    }
    this._pairs.push(pair);
  }
} 
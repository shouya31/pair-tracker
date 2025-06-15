import { PairLabel } from './PairLabel';
import { User, UserStatus } from '../user/User';

export class Pair {
  private readonly _pairId: string;
  private readonly _label: PairLabel;
  private readonly _members: User[];

  constructor(label: PairLabel, members: User[]) {
    if (!this.isValidMemberCount(members)) {
      throw new Error('Pair must have 2-3 members');
    }
    if (!this.areAllMembersActive(members)) {
      throw new Error('All pair members must be active');
    }

    this._pairId = crypto.randomUUID();
    this._label = label;
    this._members = members;
  }

  private isValidMemberCount(members: User[]): boolean {
    return members.length >= 2 && members.length <= 3;
  }

  private areAllMembersActive(members: User[]): boolean {
    return members.every(member => member.status === UserStatus.Enrolled);
  }

  get pairId(): string {
    return this._pairId;
  }

  get label(): PairLabel {
    return this._label;
  }

  get members(): User[] {
    return [...this._members];
  }

  hasMember(userId: string): boolean {
    return this._members.some(member => member.userId === userId);
  }
} 
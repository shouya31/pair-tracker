import { Entity } from '../shared/Entity';
import { PairLabel } from './vo/PairLabel';
import { User } from '../user/User';

export class Pair extends Entity {
  private constructor(
    id: string,
    private label: PairLabel,
    private members: User[] = [],
  ) {
    super(id);
    this.validateMembers();
  }

  static create(label: PairLabel, initialMembers: User[]): Pair {
    const pair = new Pair(crypto.randomUUID(), label, initialMembers);
    pair.validateMembers();
    return pair;
  }

  static reconstruct(id: string, label: PairLabel, members: User[]): Pair {
    const pair = new Pair(id, label, members);
    return pair;
  }

  getLabel(): PairLabel {
    return this.label;
  }

  getMembers(): User[] {
    return [...this.members];
  }

  addMember(user: User): void {
    if (!user.isEnrolled()) {
      throw new Error('Only enrolled users can be added to a pair');
    }
    this.members.push(user);
    this.validateMembers();
  }

  removeMember(user: User): void {
    this.members = this.members.filter((m) => !m.equals(user));
    this.validateMembers();
  }

  private validateMembers(): void {
    if (this.members.length < 2 || this.members.length > 3) {
      throw new Error('Pair must have 2-3 members');
    }
  }
} 
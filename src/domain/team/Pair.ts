import { User } from '../user/User';
import { PairName } from './vo/PairName';

export class Pair {
  private readonly name: PairName;
  private readonly members: User[];

  constructor(name: PairName, members: User[]) {
    this.name = name;
    this.members = [...members]; // 配列のコピーを作成して不変性を保持
  }

  getName(): PairName {
    return this.name;
  }

  getMembers(): User[] {
    return [...this.members]; // 配列のコピーを返して不変性を保持
  }

  equals(other: Pair): boolean {
    return this.name.equals(other.name);
  }
} 
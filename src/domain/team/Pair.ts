import { PairName } from './vo/PairName';

export class Pair {
  constructor(
    private readonly name: PairName,
    private readonly memberIds: string[]
  ) {}

  public getName(): string {
    return this.name.getValue();
  }

  public getNameVO(): PairName {
    return this.name;
  }

  public getMemberIds(): string[] {
    return [...this.memberIds];
  }

  equals(other: Pair): boolean {
    return this.name.equals(other.name);
  }
}
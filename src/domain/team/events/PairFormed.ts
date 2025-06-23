import { DomainEvent } from '../../shared/DomainEvent';

export class PairFormed implements DomainEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly teamId: string,
    public readonly pairName: string,
    public readonly memberIds: string[]
  ) {
    this.occurredAt = new Date();
  }
}
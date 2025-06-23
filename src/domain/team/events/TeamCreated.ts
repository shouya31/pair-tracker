import { DomainEvent } from '../../shared/DomainEvent';

export class TeamCreated implements DomainEvent {
  public readonly occurredAt: Date;

  constructor(
    public readonly teamId: string,
    public readonly teamName: string,
    public readonly memberIds: string[]
  ) {
    this.occurredAt = new Date();
  }
}
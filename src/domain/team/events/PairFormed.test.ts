import { PairFormed } from './PairFormed';

describe('PairFormed', () => {
  it('should create a PairFormed event with the given properties', () => {
    const teamId = 'team-1';
    const pairName = 'A';
    const memberIds = ['user-1', 'user-2'];

    const event = new PairFormed(teamId, pairName, memberIds);

    expect(event.teamId).toBe(teamId);
    expect(event.pairName).toBe(pairName);
    expect(event.memberIds).toEqual(memberIds);
  });

  it('should set occurredAt to current time when created', () => {
    const before = new Date();
    const event = new PairFormed('team-1', 'A', ['user-1', 'user-2']);
    const after = new Date();

    expect(event.occurredAt).toBeInstanceOf(Date);
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });
}); 
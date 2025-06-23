import { TeamCreated } from './TeamCreated';

describe('TeamCreated', () => {
  it('should create a TeamCreated event with the given properties', () => {
    const teamId = 'team-1';
    const teamName = 'Team A';
    const memberIds = ['user-1', 'user-2', 'user-3'];

    const event = new TeamCreated(teamId, teamName, memberIds);

    expect(event.teamId).toBe(teamId);
    expect(event.teamName).toBe(teamName);
    expect(event.memberIds).toEqual(memberIds);
  });

  it('should set occurredAt to current time when created', () => {
    const before = new Date();
    const event = new TeamCreated('team-1', 'Team A', ['user-1', 'user-2', 'user-3']);
    const after = new Date();

    expect(event.occurredAt).toBeInstanceOf(Date);
    expect(event.occurredAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
    expect(event.occurredAt.getTime()).toBeLessThanOrEqual(after.getTime());
  });
});
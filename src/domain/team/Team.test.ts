import { Team, TeamMember } from './Team';
import { TeamName } from './vo/TeamName';
import { PairName } from './vo/PairName';
import { TeamDomainError } from './errors/TeamDomainError';
import { PairFormationRequested } from './events/PairFormationRequested';
import { PairFormed } from './events/PairFormed';
import { TeamIdRequiredError, TeamIdFormatError } from './errors/TeamValidationError';

describe('Team', () => {
  const validTeamName = TeamName.create('A1');
  const validMembers: TeamMember[] = [
    { id: '1', name: 'User 1' },
    { id: '2', name: 'User 2' },
    { id: '3', name: 'User 3' },
    { id: '4', name: 'User 4' },
  ];

  describe('create', () => {
    it('should create a team with valid name and members', () => {
      const team = Team.create(validTeamName, validMembers);
      expect(team.getName()).toBe('A1');
      expect(team.getMembers()).toHaveLength(4);
    });

    it('should throw error when members are less than 3', () => {
      const invalidMembers = validMembers.slice(0, 2);
      expect(() => Team.create(validTeamName, invalidMembers))
        .toThrow(TeamDomainError);
    });

    test('メンバーIDが重複している場合はエラーになる', () => {
      const members: TeamMember[] = [
        { id: 'user1-id', name: 'user1' },
        { id: 'user2-id', name: 'user2' },
        { id: 'user1-id', name: 'user1 duplicate' },
      ];

      expect(() => Team.create(validTeamName, members))
        .toThrow(TeamDomainError);
      expect(() => Team.create(validTeamName, members))
        .toThrow('同じメンバーを複数回追加することはできません。');
    });
  });

  describe('rebuild', () => {
    const validTeamId = '123e4567-e89b-42d3-a456-556642440000';

    test('正常に再構築される', () => {
      const team = Team.rebuild(validTeamId, validTeamName, validMembers);

      expect(team.getTeamId()).toBe(validTeamId);
      expect(team.getName()).toBe('A1');
      expect(team.getMembers()).toEqual(validMembers);
    });

    test('チームIDが空の場合はエラーになる', () => {
      expect(() => Team.rebuild('', validTeamName, validMembers))
        .toThrow(TeamIdRequiredError);
    });

    test('チームIDが不正なフォーマットの場合はエラーになる', () => {
      expect(() => Team.rebuild('invalid-uuid', validTeamName, validMembers))
        .toThrow(TeamIdFormatError);
    });
  });

  describe('requestPairFormation', () => {
    let team: Team;

    beforeEach(() => {
      team = Team.create(validTeamName, validMembers);
    });

    it('should emit PairFormationRequested event for valid members', () => {
      const memberIds = ['1', '2'];
      const pairName = new PairName('A');

      team.requestPairFormation(memberIds, pairName);

      const events = team.getDomainEvents();
      expect(events).toHaveLength(2); // TeamCreated + PairFormationRequested
      expect(events[1]).toBeInstanceOf(PairFormationRequested);
      expect((events[1] as PairFormationRequested).memberIds).toEqual(memberIds);
    });

    it('should throw error when member is not in team', () => {
      const memberIds = ['1', '999'];
      const pairName = new PairName('A');

      expect(() => team.requestPairFormation(memberIds, pairName))
        .toThrow('以下のメンバーはチームに所属していません: 999');
    });

    it('should throw error when pair size is invalid', () => {
      const memberIds = ['1', '2', '3', '4'];
      const pairName = new PairName('A');

      expect(() => team.requestPairFormation(memberIds, pairName))
        .toThrow('ペアのメンバー数は2人または3人である必要があります');
    });

    it('should throw error when members are duplicated', () => {
      const memberIds = ['1', '1'];
      const pairName = new PairName('A');

      expect(() => team.requestPairFormation(memberIds, pairName))
        .toThrow('同じメンバーを複数回指定することはできません');
    });
  });

  describe('confirmPairFormation', () => {
    let team: Team;

    beforeEach(() => {
      team = Team.create(validTeamName, validMembers);
    });

    it('should create pair and emit PairFormed event when confirmation matches request', () => {
      const memberIds = ['1', '2'];
      const pairName = new PairName('A');

      team.requestPairFormation(memberIds, pairName);
      team.confirmPairFormation(memberIds);

      const events = team.getDomainEvents();
      expect(events).toHaveLength(3); // TeamCreated + PairFormationRequested + PairFormed
      expect(events[2]).toBeInstanceOf(PairFormed);
      expect((events[2] as PairFormed).memberIds).toEqual(memberIds);

      const pairs = team.getPairs();
      expect(pairs).toHaveLength(1);
      expect(pairs[0].getMemberIds()).toEqual(memberIds);
    });

    it('should throw error when there is no pending pair formation', () => {
      const memberIds = ['1', '2'];

      expect(() => team.confirmPairFormation(memberIds))
        .toThrow('ペア形成リクエストが存在しません');
    });

    it('should throw error when confirmation does not match request', () => {
      const requestedMemberIds = ['1', '2'];
      const confirmedMemberIds = ['1', '3'];
      const pairName = new PairName('A');

      team.requestPairFormation(requestedMemberIds, pairName);

      expect(() => team.confirmPairFormation(confirmedMemberIds))
        .toThrow('承認されたメンバーが、リクエストされたメンバーと一致しません');
    });
  });
});
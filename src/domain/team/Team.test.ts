import { Team, TeamMember } from './Team';
import { TeamName } from './vo/TeamName';
import { PairName } from './vo/PairName';
import { TeamDomainError } from './errors/TeamDomainError';
import { TeamIdRequiredError, TeamIdFormatError } from './errors/TeamValidationError';
import { TeamCreated } from './events/TeamCreated';
import { PairFormed } from './events/PairFormed';

describe('Team', () => {
  describe('create', () => {
    const validTeamName = new TeamName('ABC');

    test('3名以上のメンバーで正常にチームが作成される', () => {
      const members: TeamMember[] = [
        { id: 'user1-id', name: 'user1' },
        { id: 'user2-id', name: 'user2' },
        { id: 'user3-id', name: 'user3' },
      ];

      const team = Team.create(validTeamName, members);

      expect(team.getTeamId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
      expect(team.getName()).toBe('ABC');
      expect(team.getNameVO()).toBeInstanceOf(TeamName);
      expect(team.getMembers()).toHaveLength(3);
      expect(team.getMembers()).toEqual(members);

      // TeamCreatedイベントが発行されることを確認
      const events = team.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(TeamCreated);
      expect((events[0] as TeamCreated).teamName).toBe('ABC');
      expect((events[0] as TeamCreated).memberIds).toEqual(members.map(m => m.id));
    });

    test('メンバーが2名以下の場合はエラーになる', () => {
      const members: TeamMember[] = [
        { id: 'user1-id', name: 'user1' },
        { id: 'user2-id', name: 'user2' },
      ];

      expect(() => Team.create(validTeamName, members))
        .toThrow(TeamDomainError);
      expect(() => Team.create(validTeamName, members))
        .toThrow('チームには最低3名のメンバーが必要です。現在のメンバー数: 2');
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
    const validTeamName = new TeamName('ABC');
    const validTeamId = '123e4567-e89b-42d3-a456-556642440000';

    test('正常に再構築される', () => {
      const members: TeamMember[] = [
        { id: 'user1-id', name: 'user1' },
        { id: 'user2-id', name: 'user2' },
        { id: 'user3-id', name: 'user3' },
      ];

      const team = Team.rebuild(validTeamId, validTeamName, members);

      expect(team.getTeamId()).toBe(validTeamId);
      expect(team.getName()).toBe('ABC');
      expect(team.getMembers()).toEqual(members);
    });

    test('チームIDが空の場合はエラーになる', () => {
      const members: TeamMember[] = [
        { id: 'user1-id', name: 'user1' },
        { id: 'user2-id', name: 'user2' },
        { id: 'user3-id', name: 'user3' },
      ];

      expect(() => Team.rebuild('', validTeamName, members))
        .toThrow(TeamIdRequiredError);
    });

    test('チームIDが不正なフォーマットの場合はエラーになる', () => {
      const members: TeamMember[] = [
        { id: 'user1-id', name: 'user1' },
        { id: 'user2-id', name: 'user2' },
        { id: 'user3-id', name: 'user3' },
      ];

      expect(() => Team.rebuild('invalid-uuid', validTeamName, members))
        .toThrow(TeamIdFormatError);
    });
  });

  describe('formPair', () => {
    let team: Team;
    const validTeamName = new TeamName('ABC');
    const members: TeamMember[] = [
      { id: 'user1-id', name: 'user1' },
      { id: 'user2-id', name: 'user2' },
      { id: 'user3-id', name: 'user3' },
    ];

    beforeEach(() => {
      team = Team.create(validTeamName, members);
    });

    test('正常にペアが作成される', () => {
      const pairName = new PairName('A');
      const pairMemberIds = ['user1-id', 'user2-id'];

      team.formPair(pairMemberIds, pairName);

      const pairs = team.getPairs();
      expect(pairs).toHaveLength(1);
      expect(pairs[0].getName()).toBe('A');
      expect(pairs[0].getMemberIds()).toEqual(pairMemberIds);

      // PairFormedイベントが発行されることを確認
      const events = team.getDomainEvents();
      expect(events).toHaveLength(2); // TeamCreatedとPairFormed
      expect(events[1]).toBeInstanceOf(PairFormed);
      expect((events[1] as PairFormed).pairName).toBe('A');
      expect((events[1] as PairFormed).memberIds).toEqual(pairMemberIds);
    });

    test('チームに所属していないメンバーでペアを作成しようとするとエラーになる', () => {
      const pairName = new PairName('A');
      const pairMemberIds = ['user1-id', 'non-member-id'];

      expect(() => team.formPair(pairMemberIds, pairName))
        .toThrow(TeamDomainError);
      expect(() => team.formPair(pairMemberIds, pairName))
        .toThrow('以下のメンバーはチームに所属していません: non-member-id');
    });

    test('ペアのメンバー数が不正な場合はエラーになる', () => {
      const pairName = new PairName('A');
      const pairMemberIds = ['user1-id'];

      expect(() => team.formPair(pairMemberIds, pairName))
        .toThrow(TeamDomainError);
      expect(() => team.formPair(pairMemberIds, pairName))
        .toThrow('ペアのメンバー数は2人または3人である必要があります');
    });

    test('同じメンバーを複数回指定するとエラーになる', () => {
      const pairName = new PairName('A');
      const pairMemberIds = ['user1-id', 'user1-id'];

      expect(() => team.formPair(pairMemberIds, pairName))
        .toThrow(TeamDomainError);
      expect(() => team.formPair(pairMemberIds, pairName))
        .toThrow('同じメンバーを複数回指定することはできません');
    });
  });
});
import { Team } from './Team';
import { TeamName } from './vo/TeamName';
import { User } from '../user/User';
import { UserStatus } from '../user/enums/UserStatus';
import { PairName } from './vo/PairName';
import { TeamDomainError } from './errors/TeamDomainError';
import { TeamIdRequiredError, TeamIdFormatError } from './errors/TeamValidationError';

describe('Team', () => {
  describe('create', () => {
    const validTeamName = new TeamName('ABC');

    const createEnrolledUser = (name: string, email: string): User => {
      return User.create(name, email);
    };

    const createNonEnrolledUser = (name: string, email: string, status: UserStatus): User => {
      return User.rebuild(
        'dummy-id',
        name,
        email,
        status
      );
    };

    test('3名以上の在籍中メンバーで正常にチームが作成される', () => {
      const members = [
        createEnrolledUser('user1', 'user1@example.com'),
        createEnrolledUser('user2', 'user2@example.com'),
        createEnrolledUser('user3', 'user3@example.com'),
      ];

      const team = Team.create(validTeamName, members);

      expect(team.getTeamId()).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i); // UUID v4形式
      expect(team.getName()).toBe('ABC');
      expect(team.getNameVO()).toBeInstanceOf(TeamName);
      expect(team.getMembers()).toHaveLength(3);
      expect(team.getMembers()).toEqual(members);
    });

    test('メンバーが2名以下の場合はエラーになる', () => {
      const members = [
        createEnrolledUser('user1', 'user1@example.com'),
        createEnrolledUser('user2', 'user2@example.com'),
      ];

      expect(() => Team.create(validTeamName, members))
        .toThrow(TeamDomainError);
      expect(() => Team.create(validTeamName, members))
        .toThrow('チームは3名以上のメンバーが必要です（現在: 2名）');
    });

    test('非在籍中のメンバーがいる場合はエラーになる', () => {
      const members = [
        createEnrolledUser('user1', 'user1@example.com'),
        createEnrolledUser('user2', 'user2@example.com'),
        createNonEnrolledUser('user3', 'user3@example.com', UserStatus.Suspended),
      ];

      expect(() => Team.create(validTeamName, members))
        .toThrow(TeamDomainError);
      expect(() => Team.create(validTeamName, members))
        .toThrow('チームメンバーは全員が在籍中である必要があります。以下のメンバーが在籍中ではありません：user3(Suspended)');
    });

    test('退会済みのメンバーがいる場合はエラーになる', () => {
      const members = [
        createEnrolledUser('user1', 'user1@example.com'),
        createEnrolledUser('user2', 'user2@example.com'),
        createNonEnrolledUser('user3', 'user3@example.com', UserStatus.Withdrawn),
      ];

      expect(() => Team.create(validTeamName, members))
        .toThrow(TeamDomainError);
      expect(() => Team.create(validTeamName, members))
        .toThrow('チームメンバーは全員が在籍中である必要があります。以下のメンバーが在籍中ではありません：user3(Withdrawn)');
    });

    test('複数の非在籍中メンバーがいる場合は全員のステータスを表示する', () => {
      const members = [
        createEnrolledUser('user1', 'user1@example.com'),
        createNonEnrolledUser('user2', 'user2@example.com', UserStatus.Suspended),
        createNonEnrolledUser('user3', 'user3@example.com', UserStatus.Withdrawn),
      ];

      expect(() => Team.create(validTeamName, members))
        .toThrow(TeamDomainError);
      expect(() => Team.create(validTeamName, members))
        .toThrow('チームメンバーは全員が在籍中である必要があります。以下のメンバーが在籍中ではありません：user2(Suspended), user3(Withdrawn)');
    });

    test('元の配列を変更してもチームのメンバーには影響しない', () => {
      const members = [
        createEnrolledUser('user1', 'user1@example.com'),
        createEnrolledUser('user2', 'user2@example.com'),
        createEnrolledUser('user3', 'user3@example.com'),
      ];
      const team = Team.create(validTeamName, members);
      const originalLength = team.getMembers().length;

      members.push(createEnrolledUser('user4', 'user4@example.com'));

      expect(team.getMembers().length).toBe(originalLength);
      expect(members.length).toBe(originalLength + 1);
    });

    test('取得したメンバー配列を変更してもチームのメンバーには影響しない', () => {
      const members = [
        createEnrolledUser('user1', 'user1@example.com'),
        createEnrolledUser('user2', 'user2@example.com'),
        createEnrolledUser('user3', 'user3@example.com'),
      ];
      const team = Team.create(validTeamName, members);
      const originalLength = team.getMembers().length;
      const teamMembers = team.getMembers();
      teamMembers.push(createEnrolledUser('user4', 'user4@example.com'));

      expect(team.getMembers().length).toBe(originalLength);
      expect(teamMembers.length).toBe(originalLength + 1);
    });
  });

  describe('rebuild', () => {
    const validTeamName = new TeamName('ABC');
    const validUUID = '123e4567-e89b-4456-8242-123456789abc';

    const createEnrolledUser = (name: string, email: string): User => {
      return User.create(name, email);
    };

    const createNonEnrolledUser = (name: string, email: string, status: UserStatus): User => {
      return User.rebuild(
        'dummy-id',
        name,
        email,
        status
      );
    };

    test('有効なUUIDと3名以上の在籍中メンバーで正常にチームが再構築される', () => {
      const members = [
        createEnrolledUser('user1', 'user1@example.com'),
        createEnrolledUser('user2', 'user2@example.com'),
        createEnrolledUser('user3', 'user3@example.com'),
      ];

      const team = Team.rebuild(validUUID, validTeamName, members);

      expect(team.getTeamId()).toBe(validUUID);
      expect(team.getName()).toBe('ABC');
      expect(team.getNameVO()).toBeInstanceOf(TeamName);
      expect(team.getMembers()).toHaveLength(3);
      expect(team.getMembers()).toEqual(members);
    });

    test('空のチームIDの場合はエラーになる', () => {
      const members = [
        createEnrolledUser('user1', 'user1@example.com'),
        createEnrolledUser('user2', 'user2@example.com'),
        createEnrolledUser('user3', 'user3@example.com'),
      ];

      expect(() => Team.rebuild('', validTeamName, members))
        .toThrow(TeamIdRequiredError);
      expect(() => Team.rebuild('', validTeamName, members))
        .toThrow('チームIDの検証に失敗しました: この項目は必須です');
    });

    test('不正なUUID形式の場合はエラーになる', () => {
      const members = [
        createEnrolledUser('user1', 'user1@example.com'),
        createEnrolledUser('user2', 'user2@example.com'),
        createEnrolledUser('user3', 'user3@example.com'),
      ];

      expect(() => Team.rebuild('invalid-uuid', validTeamName, members))
        .toThrow(TeamIdFormatError);
      expect(() => Team.rebuild('invalid-uuid', validTeamName, members))
        .toThrow('チームIDの検証に失敗しました: UUIDの形式で入力してください');
    });

    test('メンバーが2名以下の場合はエラーになる', () => {
      const members = [
        createEnrolledUser('user1', 'user1@example.com'),
        createEnrolledUser('user2', 'user2@example.com'),
      ];

      expect(() => Team.rebuild(validUUID, validTeamName, members))
        .toThrow(TeamDomainError);
      expect(() => Team.rebuild(validUUID, validTeamName, members))
        .toThrow('チームは3名以上のメンバーが必要です（現在: 2名）');
    });

    test('非在籍中のメンバーがいる場合はエラーになる', () => {
      const members = [
        createEnrolledUser('user1', 'user1@example.com'),
        createEnrolledUser('user2', 'user2@example.com'),
        createNonEnrolledUser('user3', 'user3@example.com', UserStatus.Suspended),
      ];

      expect(() => Team.rebuild(validUUID, validTeamName, members))
        .toThrow(TeamDomainError);
      expect(() => Team.rebuild(validUUID, validTeamName, members))
        .toThrow('チームメンバーは全員が在籍中である必要があります。以下のメンバーが在籍中ではありません：user3(Suspended)');
    });

    test('元の配列を変更してもチームのメンバーには影響しない', () => {
      const members = [
        createEnrolledUser('user1', 'user1@example.com'),
        createEnrolledUser('user2', 'user2@example.com'),
        createEnrolledUser('user3', 'user3@example.com'),
      ];
      const team = Team.rebuild(validUUID, validTeamName, members);
      const originalLength = team.getMembers().length;

      members.push(createEnrolledUser('user4', 'user4@example.com'));

      expect(team.getMembers().length).toBe(originalLength);
      expect(members.length).toBe(originalLength + 1);
    });
  });

  describe('formPair', () => {
    const validTeamName = new TeamName('ABC');
    let team: Team;
    let teamMembers: User[];

    beforeEach(() => {
      teamMembers = [
        User.create('user1', 'user1@example.com'),
        User.create('user2', 'user2@example.com'),
        User.create('user3', 'user3@example.com'),
        User.create('user4', 'user4@example.com'),
      ];
      team = Team.create(validTeamName, teamMembers);
    });

    test('2名のメンバーで正常にペアを作成できる', () => {
      const membersToPair = [teamMembers[0], teamMembers[1]];
      const pairName = new PairName('A');

      team.formPair(membersToPair, pairName);
      const pairs = team.getPairs();

      expect(pairs).toHaveLength(1);
      expect(pairs[0].getName().getValue()).toBe('A');
      expect(pairs[0].getMembers()).toHaveLength(2);
      expect(pairs[0].getMembers()).toEqual(membersToPair);
    });

    test('3名のメンバーで正常にペアを作成できる', () => {
      const membersToPair = [teamMembers[0], teamMembers[1], teamMembers[2]];
      const pairName = new PairName('B');

      team.formPair(membersToPair, pairName);
      const pairs = team.getPairs();

      expect(pairs).toHaveLength(1);
      expect(pairs[0].getName().getValue()).toBe('B');
      expect(pairs[0].getMembers()).toHaveLength(3);
      expect(pairs[0].getMembers()).toEqual(membersToPair);
    });

    test('1名のメンバーでペアを作成しようとするとエラーになる', () => {
      const membersToPair = [teamMembers[0]];
      const pairName = new PairName('C');

      expect(() => team.formPair(membersToPair, pairName))
        .toThrow(TeamDomainError);
      expect(() => team.formPair(membersToPair, pairName))
        .toThrow('ペアは2名または3名で構成する必要があります（現在: 1名）');
    });

    test('4名以上のメンバーでペアを作成しようとするとエラーになる', () => {
      const membersToPair = [teamMembers[0], teamMembers[1], teamMembers[2], teamMembers[3]];
      const pairName = new PairName('D');

      expect(() => team.formPair(membersToPair, pairName))
        .toThrow(TeamDomainError);
      expect(() => team.formPair(membersToPair, pairName))
        .toThrow('ペアは2名または3名で構成する必要があります（現在: 4名）');
    });

    test('チームに所属していないメンバーでペアを作成しようとするとエラーになる', () => {
      const nonTeamMember = User.create('outsider', 'outsider@example.com');
      const membersToPair = [teamMembers[0], nonTeamMember];
      const pairName = new PairName('E');

      expect(() => team.formPair(membersToPair, pairName))
        .toThrow(TeamDomainError);
      expect(() => team.formPair(membersToPair, pairName))
        .toThrow('以下のメンバーはチームに所属していません：outsider');
    });

    test('複数のペアを作成できる', () => {
      const pair1Members = [teamMembers[0], teamMembers[1]];
      const pair2Members = [teamMembers[2], teamMembers[3]];
      const pair1Name = new PairName('A');
      const pair2Name = new PairName('B');

      team.formPair(pair1Members, pair1Name);
      team.formPair(pair2Members, pair2Name);
      const pairs = team.getPairs();

      expect(pairs).toHaveLength(2);
      expect(pairs[0].getName().getValue()).toBe('A');
      expect(pairs[1].getName().getValue()).toBe('B');
    });
  });
});
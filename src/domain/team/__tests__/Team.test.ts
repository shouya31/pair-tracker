import { Team } from '../Team';
import { TeamName } from '../vo/TeamName';
import { User } from '../../user/User';
import { UserStatus } from '../../user/enums/UserStatus';

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
        .toThrow('チームは3名以上のメンバーが必要です');
    });

    test('非在籍中のメンバーがいる場合はエラーになる', () => {
      const members = [
        createEnrolledUser('user1', 'user1@example.com'),
        createEnrolledUser('user2', 'user2@example.com'),
        createNonEnrolledUser('user3', 'user3@example.com', UserStatus.Suspended),
      ];

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
        .toThrow('チームメンバーは全員が在籍中である必要があります。以下のメンバーが在籍中ではありません：user3(Withdrawn)');
    });

    test('複数の非在籍中メンバーがいる場合は全員のステータスを表示する', () => {
      const members = [
        createEnrolledUser('user1', 'user1@example.com'),
        createNonEnrolledUser('user2', 'user2@example.com', UserStatus.Suspended),
        createNonEnrolledUser('user3', 'user3@example.com', UserStatus.Withdrawn),
      ];

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
});
import { TeamMembers } from './TeamMembers';
import { TeamDomainError } from '../errors/TeamDomainError';

describe('TeamMembers', () => {
  describe('create', () => {
    test('3名以上のメンバーで正常に作成される', () => {
      const members = [
        { id: 'user1', name: 'User 1' },
        { id: 'user2', name: 'User 2' },
        { id: 'user3', name: 'User 3' },
      ];

      const teamMembers = TeamMembers.create(members);

      expect(teamMembers.getMembers()).toEqual(members);
      expect(teamMembers.getMemberIds()).toEqual(['user1', 'user2', 'user3']);
      expect(teamMembers.count()).toBe(3);
    });

    test('メンバーが2名以下の場合はエラーになる', () => {
      const members = [
        { id: 'user1', name: 'User 1' },
        { id: 'user2', name: 'User 2' },
      ];

      expect(() => TeamMembers.create(members))
        .toThrow(TeamDomainError);
      expect(() => TeamMembers.create(members))
        .toThrow('チームには最低3名のメンバーが必要です。現在のメンバー数: 2');
    });

    test('メンバーIDが重複している場合はエラーになる', () => {
      const members = [
        { id: 'user1', name: 'User 1' },
        { id: 'user2', name: 'User 2' },
        { id: 'user1', name: 'User 1 Duplicate' }, // 重複するID
      ];

      expect(() => TeamMembers.create(members))
        .toThrow(TeamDomainError);
      expect(() => TeamMembers.create(members))
        .toThrow('同じメンバーを複数回指定することはできません');
    });
  });

  describe('contains', () => {
    const members = [
      { id: 'user1', name: 'User 1' },
      { id: 'user2', name: 'User 2' },
      { id: 'user3', name: 'User 3' },
    ];
    const teamMembers = TeamMembers.create(members);

    test('含まれているメンバーの場合はtrueを返す', () => {
      expect(teamMembers.contains('user1')).toBe(true);
    });

    test('含まれていないメンバーの場合はfalseを返す', () => {
      expect(teamMembers.contains('user4')).toBe(false);
    });
  });
});
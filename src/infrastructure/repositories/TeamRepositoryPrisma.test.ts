import { PrismaClient } from '@prisma/client';
import { TeamRepositoryPrisma } from './TeamRepositoryPrisma';
import { Team } from '../../domain/team/Team';
import { TeamName } from '../../domain/team/vo/TeamName';
import { TeamDomainError } from '../../domain/team/errors/TeamDomainError';

describe('TeamRepositoryPrisma', () => {
  let prisma: PrismaClient;
  let teamRepository: TeamRepositoryPrisma;
  let testTeam: Team;
  let testUserIds: string[];

  beforeEach(async () => {
    prisma = new PrismaClient();
    teamRepository = new TeamRepositoryPrisma(prisma);

    // テスト用のユーザーIDを作成
    testUserIds = [
      '12345678-1234-4123-8123-123456789abc',
      '12345678-1234-4123-8123-123456789def',
      '12345678-1234-4123-8123-123456789ghi',
      '12345678-1234-4123-8123-123456789jkl', // 追加のユーザーID
      '12345678-1234-4123-8123-123456789mno', // 追加のユーザーID
    ];

    // テスト用のチームを作成
    const teamName = TeamName.create('ABC');
    testTeam = Team.create(
      teamName,
      [
        { id: testUserIds[0], name: 'user1' },
        { id: testUserIds[1], name: 'user2' },
        { id: testUserIds[2], name: 'user3' },
      ]
    );

    // データベースをクリーンアップ
    await prisma.teamUser.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();

    // テストユーザーをデータベースに作成
    for (let i = 0; i < testUserIds.length; i++) {
      await prisma.user.create({
        data: {
          id: testUserIds[i],
          name: `user${i + 1}`,
          email: `user${i + 1}@example.com`,
        },
      });
    }
  });

  afterEach(async () => {
    await prisma.$disconnect();
  });

  describe('findByName', () => {
    it('should return team when found by name', async () => {
      // チームを保存
      await teamRepository.save(testTeam);

      // 名前で検索
      const found = await teamRepository.findByName(TeamName.create('ABC'));
      
      expect(found).not.toBeNull();
      expect(found?.getName()).toBe('ABC');
      expect(found?.getMembers()).toHaveLength(3);
    });

    it('should return null when team not found by name', async () => {
      const found = await teamRepository.findByName(TeamName.create('XYZ'));
      expect(found).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return team when found by id', async () => {
      // チームを保存
      await teamRepository.save(testTeam);

      // IDで検索
      const found = await teamRepository.findById(testTeam.getTeamId());
      
      expect(found).not.toBeNull();
      expect(found?.getTeamId()).toBe(testTeam.getTeamId());
      expect(found?.getMembers()).toHaveLength(3);
    });

    it('should return null when team not found by id', async () => {
      const found = await teamRepository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('save', () => {
    it('should create a new team with members', async () => {
      await teamRepository.save(testTeam);

      const savedTeam = await prisma.team.findUnique({
        where: { id: testTeam.getTeamId() },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      expect(savedTeam).not.toBeNull();
      expect(savedTeam?.name).toBe('ABC');
      expect(savedTeam?.members).toHaveLength(3);
      expect(savedTeam?.members.map(m => m.userId).sort()).toEqual(testUserIds.slice(0, 3).sort());
    });

    it('should update existing team name', async () => {
      // 最初のチームを保存
      await teamRepository.save(testTeam);

      // チーム名を更新
      const updatedTeam = Team.rebuild(
        testTeam.getTeamId(),
        TeamName.create('XYZ'),
        testTeam.getMembers()
      );

      await teamRepository.save(updatedTeam);

      const found = await teamRepository.findById(testTeam.getTeamId());
      expect(found?.getName()).toBe('XYZ');
    });

    it('should add new members to existing team', async () => {
      // 最初のチームを保存
      await teamRepository.save(testTeam);

      // メンバーを追加
      const updatedTeam = Team.rebuild(
        testTeam.getTeamId(),
        TeamName.create('ABC'),
        [
          ...testTeam.getMembers(),
          { id: testUserIds[3], name: 'user4' },
        ]
      );

      await teamRepository.save(updatedTeam);

      const found = await prisma.teamUser.findMany({
        where: { teamId: testTeam.getTeamId() },
      });
      expect(found).toHaveLength(4);
      expect(found.map(m => m.userId).sort()).toEqual(testUserIds.slice(0, 4).sort());
    });

    it('should update team members while maintaining minimum member count', async () => {
      // 最初のチームを保存
      await teamRepository.save(testTeam);

      // メンバーを更新（3名を維持）
      const updatedTeam = Team.rebuild(
        testTeam.getTeamId(),
        TeamName.create('ABC'),
        [
          { id: testUserIds[2], name: 'user3' },
          { id: testUserIds[3], name: 'user4' },
          { id: testUserIds[4], name: 'user5' },
        ]
      );

      await teamRepository.save(updatedTeam);

      const found = await prisma.teamUser.findMany({
        where: { teamId: testTeam.getTeamId() },
      });
      expect(found).toHaveLength(3);
      expect(found.map(m => m.userId).sort()).toEqual([testUserIds[2], testUserIds[3], testUserIds[4]].sort());
    });

    it('should throw error when trying to update with less than 3 members', async () => {
      // 最初のチームを保存
      await teamRepository.save(testTeam);

      // 2名のメンバーでの更新を試みる
      await expect(async () => {
        const invalidTeam = Team.rebuild(
          testTeam.getTeamId(),
          TeamName.create('ABC'),
          [
            { id: testUserIds[0], name: 'user1' },
            { id: testUserIds[1], name: 'user2' },
          ]
        );
        await teamRepository.save(invalidTeam);
      }).rejects.toThrow(TeamDomainError);

      // データベースの状態が変更されていないことを確認
      const found = await prisma.teamUser.findMany({
        where: { teamId: testTeam.getTeamId() },
      });
      expect(found).toHaveLength(3);
      expect(found.map(m => m.userId).sort()).toEqual(testUserIds.slice(0, 3).sort());
    });
  });
}); 
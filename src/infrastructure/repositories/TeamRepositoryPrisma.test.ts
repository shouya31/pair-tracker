import { PrismaClient } from '@prisma/client';
import { TeamRepositoryPrisma } from './TeamRepositoryPrisma';
import { Team } from '../../domain/team/Team';
import { TeamName } from '../../domain/team/vo/TeamName';
import { User } from '../../domain/user/User';
import { UserStatus } from '../../domain/user/enums/UserStatus';

describe('TeamRepositoryPrisma', () => {
  let prisma: PrismaClient;
  let teamRepository: TeamRepositoryPrisma;
  let testUsers: User[];
  let testTeam: Team;

  beforeEach(async () => {
    prisma = new PrismaClient();
    teamRepository = new TeamRepositoryPrisma(prisma);

    // テスト用のユーザーを作成
    testUsers = [
      User.create('user1', 'user1@example.com'),
      User.create('user2', 'user2@example.com'),
      User.create('user3', 'user3@example.com'),
    ];

    // テスト用のチームを作成
    testTeam = Team.create(
      new TeamName('ABC'),
      testUsers,
    );

    // データベースをクリーンアップ
    await prisma.teamUser.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();

    // テストユーザーをデータベースに作成
    for (const user of testUsers) {
      await prisma.user.create({
        data: {
          id: user.getUserId(),
          name: user.getName(),
          email: user.getEmail(),
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
      const found = await teamRepository.findByName(new TeamName('ABC'));
      
      expect(found).not.toBeNull();
      expect(found?.getName()).toBe('ABC');
      expect(found?.getMembers()).toHaveLength(3);
    });

    it('should return null when team not found by name', async () => {
      const found = await teamRepository.findByName(new TeamName('XYZ'));
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
    });

    it('should update existing team', async () => {
      // 最初のチームを保存
      await teamRepository.save(testTeam);

      // チーム名を更新
      const updatedTeam = Team.rebuild(
        testTeam.getTeamId(),
        new TeamName('XYZ'),
        testUsers,
      );

      await teamRepository.save(updatedTeam);

      const found = await teamRepository.findById(testTeam.getTeamId());
      expect(found?.getName()).toBe('XYZ');
    });
  });
}); 
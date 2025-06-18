import { PrismaClient } from '@prisma/client';
import { TeamRepositoryPrisma } from '../TeamRepositoryPrisma';
import { Team } from '../../../domain/team/Team';
import { TeamName } from '../../../domain/team/vo/TeamName';
import { User } from '../../../domain/user/User';
import { UserStatus } from '../../../domain/user/enums/UserStatus';

describe('TeamRepositoryPrisma', () => {
  let prisma: PrismaClient;
  let repository: TeamRepositoryPrisma;

  beforeAll(() => {
    prisma = new PrismaClient();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  beforeEach(async () => {
    repository = new TeamRepositoryPrisma(prisma);
    await prisma.teamUser.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();
  });

  describe('save', () => {
    test('新規チームを保存できる', async () => {
      // テスト用のユーザーを作成
      const userPromises = ['user-1', 'user-2', 'user-3'].map(id =>
        prisma.user.create({
          data: {
            id,
            name: `User ${id.split('-')[1]}`,
            email: `user${id.split('-')[1]}@example.com`,
          },
        })
      );
      const userRecords = await Promise.all(userPromises);

      const domainUsers = userRecords.map(user =>
        User.rebuild(user.id, user.name, user.email, UserStatus.Enrolled)
      );

      const team = Team.create(new TeamName('ABC'), domainUsers);
      await repository.save(team);

      // 保存されたデータを確認
      const savedTeam = await prisma.team.findUnique({
        where: { id: team.getTeamId() },
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

      const memberIds = savedTeam?.members.map(m => m.userId).sort() ?? [];
      const expectedIds = userRecords.map(u => u.id).sort();
      expect(memberIds).toEqual(expectedIds);
    });

    test('既存のチームを更新できる', async () => {
      // テスト用のユーザーを作成
      const userPromises = ['user-1', 'user-2', 'user-3', 'user-4'].map(id =>
        prisma.user.create({
          data: {
            id,
            name: `User ${id.split('-')[1]}`,
            email: `user${id.split('-')[1]}@example.com`,
          },
        })
      );
      const userRecords = await Promise.all(userPromises);

      const initialUsers = userRecords.slice(0, 3).map(user =>
        User.rebuild(user.id, user.name, user.email, UserStatus.Enrolled)
      );

      const team = Team.create(new TeamName('ABC'), initialUsers);
      await repository.save(team);

      // チームを更新
      const updatedUsers = userRecords.slice(1, 4).map(user =>
        User.rebuild(user.id, user.name, user.email, UserStatus.Enrolled)
      );
      const updatedTeam = Team.rebuild(team.getTeamId(), new TeamName('XYZ'), updatedUsers);
      await repository.save(updatedTeam);

      // 更新されたデータを確認
      const savedTeam = await prisma.team.findUnique({
        where: { id: team.getTeamId() },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      expect(savedTeam).not.toBeNull();
      expect(savedTeam?.name).toBe('XYZ');
      expect(savedTeam?.members).toHaveLength(3);

      const memberIds = savedTeam?.members.map(m => m.userId).sort() ?? [];
      const expectedIds = userRecords.slice(1, 4).map(u => u.id).sort();
      expect(memberIds).toEqual(expectedIds);
    });
  });

  describe('findByName', () => {
    test('チーム名で検索できる', async () => {
      // テスト用のユーザーを作成
      const userPromises = ['user-1', 'user-2', 'user-3'].map(id =>
        prisma.user.create({
          data: {
            id,
            name: `User ${id.split('-')[1]}`,
            email: `user${id.split('-')[1]}@example.com`,
          },
        })
      );
      const userRecords = await Promise.all(userPromises);

      const domainUsers = userRecords.map(user =>
        User.rebuild(user.id, user.name, user.email, UserStatus.Enrolled)
      );

      const team = Team.create(new TeamName('ABC'), domainUsers);
      await repository.save(team);

      // チームを検索
      const foundTeam = await repository.findByName(new TeamName('ABC'));

      expect(foundTeam).not.toBeNull();
      expect(foundTeam?.getName()).toBe('ABC');
      expect(foundTeam?.getMembers()).toHaveLength(3);

      const memberEmails = foundTeam?.getMembers().map(m => m.getEmail()).sort();
      const expectedEmails = userRecords.map(u => u.email).sort();
      expect(memberEmails).toEqual(expectedEmails);
    });

    test('存在しないチーム名の場合はnullを返す', async () => {
      const foundTeam = await repository.findByName(new TeamName('XYZ'));
      expect(foundTeam).toBeNull();
    });

    test('メンバーが不足しているチームの場合はnullを返す', async () => {
      // メンバーが2名のチームを作成
      await prisma.team.create({
        data: {
          id: 'team-1',
          name: 'ABC',
          members: {
            create: [
              {
                id: 'team-user-1',
                user: {
                  create: {
                    id: 'user-1',
                    name: 'User 1',
                    email: 'user1@example.com',
                  },
                },
              },
              {
                id: 'team-user-2',
                user: {
                  create: {
                    id: 'user-2',
                    name: 'User 2',
                    email: 'user2@example.com',
                  },
                },
              },
            ],
          },
        },
      });

      const foundTeam = await repository.findByName(new TeamName('ABC'));
      expect(foundTeam).toBeNull();
    });
  });
}); 
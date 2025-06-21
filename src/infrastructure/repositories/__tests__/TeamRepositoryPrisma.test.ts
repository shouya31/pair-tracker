import { PrismaClient } from '@prisma/client';
import { TeamRepositoryPrisma } from '../TeamRepositoryPrisma';
import { Team } from '../../../domain/team/Team';
import { TeamName } from '../../../domain/team/vo/TeamName';
import { User } from '../../../domain/user/User';
import { UserStatus } from '../../../domain/user/enums/UserStatus';
import { PairName } from '../../../domain/team/vo/PairName';

type PrismaUser = {
  id: string;
  name: string;
  email: string;
};

type PrismaPair = {
  id: string;
  name: string;
  teamId: string;
  members: {
    userId: string;
    user: PrismaUser;
  }[];
};

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
    await prisma.$transaction([
      prisma.userPair.deleteMany(),
      prisma.pair.deleteMany(),
      prisma.teamUser.deleteMany(),
      prisma.team.deleteMany(),
      prisma.user.deleteMany(),
    ]);
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

    test('ペアを含むチームを保存できる', async () => {
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

      const domainUsers = userRecords.map(user =>
        User.rebuild(user.id, user.name, user.email, UserStatus.Enrolled)
      );

      const team = Team.create(new TeamName('ABC'), domainUsers);
      
      // ペアを作成
      team.formPair(
        [domainUsers[0], domainUsers[1]], 
        new PairName('A')
      );
      team.formPair(
        [domainUsers[2], domainUsers[3]], 
        new PairName('B')
      );

      await repository.save(team);

      // 保存されたデータを確認
      const savedTeamData = await prisma.team.findUnique({
        where: { id: team.getTeamId() },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      });

      expect(savedTeamData).not.toBeNull();

      // ペアの確認
      const savedPairs = await prisma.pair.findMany({
        where: { teamId: team.getTeamId() },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      }) as PrismaPair[];

      expect(savedPairs).toHaveLength(2);

      // ペアAの確認
      const pairA = savedPairs.find((p: PrismaPair) => p.name === 'A');
      expect(pairA).not.toBeUndefined();
      expect(pairA?.members).toHaveLength(2);
      const pairAMemberIds = pairA?.members.map((m) => m.userId).sort();
      expect(pairAMemberIds).toEqual([userRecords[0].id, userRecords[1].id].sort());

      // ペアBの確認
      const pairB = savedPairs.find((p: PrismaPair) => p.name === 'B');
      expect(pairB).not.toBeUndefined();
      expect(pairB?.members).toHaveLength(2);
      const pairBMemberIds = pairB?.members.map((m) => m.userId).sort();
      expect(pairBMemberIds).toEqual([userRecords[2].id, userRecords[3].id].sort());
    });

    test('ペアの更新が正しく行われる', async () => {
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

      const domainUsers = userRecords.map(user =>
        User.rebuild(user.id, user.name, user.email, UserStatus.Enrolled)
      );

      const team = Team.create(new TeamName('ABC'), domainUsers);
      
      // 初期ペアを作成
      team.formPair(
        [domainUsers[0], domainUsers[1]], 
        new PairName('A')
      );
      team.formPair(
        [domainUsers[2], domainUsers[3]], 
        new PairName('B')
      );

      await repository.save(team);

      // チームを再構築してペアを変更
      const updatedTeam = Team.rebuild(team.getTeamId(), team.getNameVO(), domainUsers);
      updatedTeam.formPair(
        [domainUsers[0], domainUsers[2]], 
        new PairName('C')
      );
      updatedTeam.formPair(
        [domainUsers[1], domainUsers[3]], 
        new PairName('D')
      );

      await repository.save(updatedTeam);

      // 更新されたデータを確認
      const savedPairs = await prisma.pair.findMany({
        where: { teamId: team.getTeamId() },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      }) as PrismaPair[];

      expect(savedPairs).toHaveLength(2);

      // 古いペアが削除されていることを確認
      const oldPairs = savedPairs.filter((p: PrismaPair) => p.name === 'A' || p.name === 'B');
      expect(oldPairs).toHaveLength(0);

      // 新しいペアが作成されていることを確認
      const pairC = savedPairs.find((p: PrismaPair) => p.name === 'C');
      expect(pairC).not.toBeUndefined();
      expect(pairC?.members).toHaveLength(2);
      const pairCMemberIds = pairC?.members.map((m) => m.userId).sort();
      expect(pairCMemberIds).toEqual([userRecords[0].id, userRecords[2].id].sort());

      const pairD = savedPairs.find((p: PrismaPair) => p.name === 'D');
      expect(pairD).not.toBeUndefined();
      expect(pairD?.members).toHaveLength(2);
      const pairDMemberIds = pairD?.members.map((m) => m.userId).sort();
      expect(pairDMemberIds).toEqual([userRecords[1].id, userRecords[3].id].sort());
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
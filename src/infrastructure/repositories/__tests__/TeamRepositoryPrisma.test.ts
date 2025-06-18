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
    // テストデータのクリーンアップ
    await prisma.$executeRaw`TRUNCATE TABLE "TeamUser" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "Team" CASCADE`;
    await prisma.$executeRaw`TRUNCATE TABLE "User" CASCADE`;
  });

  describe('save', () => {
    test('新規チームを保存できる', async () => {
      // テスト用のユーザーを作成
      await Promise.all([
        prisma.$executeRaw`
          INSERT INTO "User" (id, name, email, "createdAt", "updatedAt")
          VALUES ('user-1', 'User 1', 'user1@example.com', NOW(), NOW())
        `,
        prisma.$executeRaw`
          INSERT INTO "User" (id, name, email, "createdAt", "updatedAt")
          VALUES ('user-2', 'User 2', 'user2@example.com', NOW(), NOW())
        `,
        prisma.$executeRaw`
          INSERT INTO "User" (id, name, email, "createdAt", "updatedAt")
          VALUES ('user-3', 'User 3', 'user3@example.com', NOW(), NOW())
        `,
      ]);

      const userRecords = await prisma.$queryRaw<Array<{ id: string; name: string; email: string }>>`
        SELECT id, name, email FROM "User" ORDER BY id
      `;

      const domainUsers = userRecords.map(user =>
        User.rebuild(user.id, user.name, user.email, UserStatus.Enrolled)
      );

      const team = Team.create(new TeamName('ABC'), domainUsers);
      await repository.save(team);

      // 保存されたデータを確認
      const savedTeamData = await prisma.$queryRaw<Array<{
        id: string;
        name: string;
        members: Array<{
          userId: string;
          user: {
            id: string;
            name: string;
            email: string;
          };
        }>;
      }>>`
        SELECT
          t.id,
          t.name,
          COALESCE(
            json_agg(
              json_build_object(
                'userId', tu."userId",
                'user', json_build_object(
                  'id', u.id,
                  'name', u.name,
                  'email', u.email
                )
              )
            ) FILTER (WHERE u.id IS NOT NULL),
            '[]'
          ) as members
        FROM "Team" t
        LEFT JOIN "TeamUser" tu ON t.id = tu."teamId"
        LEFT JOIN "User" u ON tu."userId" = u.id
        WHERE t.id = ${team.getTeamId()}
        GROUP BY t.id, t.name
      `;

      const savedTeam = savedTeamData[0];
      expect(savedTeam).not.toBeNull();
      expect(savedTeam.name).toBe('ABC');
      expect(savedTeam.members).toHaveLength(3);

      const memberIds = savedTeam.members.map(m => m.userId).sort();
      const expectedIds = userRecords.map(u => u.id).sort();
      expect(memberIds).toEqual(expectedIds);
    });

    test('既存のチームを更新できる', async () => {
      // テスト用のユーザーを作成
      await Promise.all([
        prisma.$executeRaw`
          INSERT INTO "User" (id, name, email, "createdAt", "updatedAt")
          VALUES ('user-1', 'User 1', 'user1@example.com', NOW(), NOW())
        `,
        prisma.$executeRaw`
          INSERT INTO "User" (id, name, email, "createdAt", "updatedAt")
          VALUES ('user-2', 'User 2', 'user2@example.com', NOW(), NOW())
        `,
        prisma.$executeRaw`
          INSERT INTO "User" (id, name, email, "createdAt", "updatedAt")
          VALUES ('user-3', 'User 3', 'user3@example.com', NOW(), NOW())
        `,
        prisma.$executeRaw`
          INSERT INTO "User" (id, name, email, "createdAt", "updatedAt")
          VALUES ('user-4', 'User 4', 'user4@example.com', NOW(), NOW())
        `,
      ]);

      const userRecords = await prisma.$queryRaw<Array<{ id: string; name: string; email: string }>>`
        SELECT id, name, email FROM "User" ORDER BY id
      `;

      const initialUsers = userRecords.slice(0, 3).map(user =>
        User.rebuild(user.id, user.name, user.email, UserStatus.Enrolled)
      );

      const team = Team.create(new TeamName('ABC'), initialUsers);
      await repository.save(team);

      // チームを更新
      const updatedUsers = userRecords.slice(1, 4).map(user =>
        User.rebuild(user.id, user.name, user.email, UserStatus.Enrolled)
      );
      const updatedTeam = Team.create(new TeamName('XYZ'), updatedUsers);
      Object.defineProperty(updatedTeam, 'teamId', { value: team.getTeamId() });
      await repository.save(updatedTeam);

      // 更新されたデータを確認
      const savedTeamData = await prisma.$queryRaw<Array<{
        id: string;
        name: string;
        members: Array<{
          userId: string;
          user: {
            id: string;
            name: string;
            email: string;
          };
        }>;
      }>>`
        SELECT
          t.id,
          t.name,
          COALESCE(
            json_agg(
              json_build_object(
                'userId', tu."userId",
                'user', json_build_object(
                  'id', u.id,
                  'name', u.name,
                  'email', u.email
                )
              )
            ) FILTER (WHERE u.id IS NOT NULL),
            '[]'
          ) as members
        FROM "Team" t
        LEFT JOIN "TeamUser" tu ON t.id = tu."teamId"
        LEFT JOIN "User" u ON tu."userId" = u.id
        WHERE t.id = ${team.getTeamId()}
        GROUP BY t.id, t.name
      `;

      const savedTeam = savedTeamData[0];
      expect(savedTeam).not.toBeNull();
      expect(savedTeam.name).toBe('XYZ');
      expect(savedTeam.members).toHaveLength(3);

      const memberIds = savedTeam.members.map(m => m.userId).sort();
      const expectedIds = userRecords.slice(1, 4).map(u => u.id).sort();
      expect(memberIds).toEqual(expectedIds);
    });
  });

  describe('findByName', () => {
    test('チーム名で検索できる', async () => {
      // テスト用のユーザーを作成
      await Promise.all([
        prisma.$executeRaw`
          INSERT INTO "User" (id, name, email, "createdAt", "updatedAt")
          VALUES ('user-1', 'User 1', 'user1@example.com', NOW(), NOW())
        `,
        prisma.$executeRaw`
          INSERT INTO "User" (id, name, email, "createdAt", "updatedAt")
          VALUES ('user-2', 'User 2', 'user2@example.com', NOW(), NOW())
        `,
        prisma.$executeRaw`
          INSERT INTO "User" (id, name, email, "createdAt", "updatedAt")
          VALUES ('user-3', 'User 3', 'user3@example.com', NOW(), NOW())
        `,
      ]);

      const userRecords = await prisma.$queryRaw<Array<{ id: string; name: string; email: string }>>`
        SELECT id, name, email FROM "User" ORDER BY id
      `;

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
      const teamId = 'team-1';
      await prisma.$executeRaw`
        INSERT INTO "Team" (id, name, "createdAt", "updatedAt")
        VALUES (${teamId}, 'ABC', NOW(), NOW())
      `;

      // 2名のメンバーを追加
      await Promise.all([
        prisma.$executeRaw`
          INSERT INTO "User" (id, name, email, "createdAt", "updatedAt")
          VALUES ('user-1', 'User 1', 'user1@example.com', NOW(), NOW())
        `,
        prisma.$executeRaw`
          INSERT INTO "User" (id, name, email, "createdAt", "updatedAt")
          VALUES ('user-2', 'User 2', 'user2@example.com', NOW(), NOW())
        `,
      ]);

      await Promise.all([
        prisma.$executeRaw`
          INSERT INTO "TeamUser" (id, "teamId", "userId", role, "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${teamId}, 'user-1', 'MEMBER', NOW(), NOW())
        `,
        prisma.$executeRaw`
          INSERT INTO "TeamUser" (id, "teamId", "userId", role, "createdAt", "updatedAt")
          VALUES (gen_random_uuid(), ${teamId}, 'user-2', 'MEMBER', NOW(), NOW())
        `,
      ]);

      const foundTeam = await repository.findByName(new TeamName('ABC'));
      expect(foundTeam).toBeNull();
    });
  });
}); 
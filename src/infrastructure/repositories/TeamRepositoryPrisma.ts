import { PrismaClient } from '@prisma/client';
import { ITeamRepository } from '../../domain/team/ITeamRepository';
import { Team } from '../../domain/team/Team';
import { TeamName } from '../../domain/team/vo/TeamName';
import { User } from '../../domain/user/User';
import { UserStatus } from '../../domain/user/enums/UserStatus';

export class TeamRepositoryPrisma implements ITeamRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByName(name: TeamName): Promise<Team | null> {
    const teamData = await this.prisma.$queryRaw<Array<{
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
      WHERE t.name = ${name.getValue()}
      GROUP BY t.id, t.name
    `;

    if (teamData.length === 0) {
      return null;
    }

    const team = teamData[0];
    const members = team.members.map(member =>
      User.rebuild(
        member.user.id,
        member.user.name,
        member.user.email,
        UserStatus.Enrolled,
      ),
    );

    // メンバーが3名未満の場合はnullを返す
    if (members.length < 3) {
      return null;
    }

    try {
      return Team.create(new TeamName(team.name), members);
    } catch (error) {
      return null;
    }
  }

  async save(team: Team): Promise<void> {
    const teamId = team.getTeamId();
    const teamName = team.getName();
    const members = team.getMembers();

    await this.prisma.$transaction(async tx => {
      // チームの保存/更新
      await tx.$executeRaw`
        INSERT INTO "Team" (id, name, "createdAt", "updatedAt")
        VALUES (${teamId}, ${teamName}, NOW(), NOW())
        ON CONFLICT (id) DO UPDATE
        SET name = ${teamName},
            "updatedAt" = NOW()
      `;

      // 既存のメンバー関係を削除
      await tx.$executeRaw`
        DELETE FROM "TeamUser"
        WHERE "teamId" = ${teamId}
      `;

      // 新しいメンバー関係を作成
      for (const member of members) {
        await tx.$executeRaw`
          INSERT INTO "TeamUser" (
            id,
            "teamId",
            "userId",
            role,
            "createdAt",
            "updatedAt"
          )
          VALUES (
            gen_random_uuid(),
            ${teamId},
            ${member.getUserId()},
            'MEMBER',
            NOW(),
            NOW()
          )
        `;
      }
    });
  }
} 
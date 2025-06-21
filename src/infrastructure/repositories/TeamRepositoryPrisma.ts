import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ITeamRepository } from '../../domain/team/ITeamRepository';
import { Team } from '../../domain/team/Team';
import { TeamName } from '../../domain/team/vo/TeamName';
import { User } from '../../domain/user/User';
import { UserStatus } from '../../domain/user/enums/UserStatus';
import { Prisma } from '@prisma/client';

export class TeamRepositoryPrisma implements ITeamRepository {
  constructor(private readonly prisma: PrismaClient) {}

  private async findTeamByCondition(where: Prisma.TeamWhereUniqueInput): Promise<Team | null> {
    const teamData = await this.prisma.team.findUnique({
      where,
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!teamData) {
      return null;
    }

    const members = teamData.members.map(member =>
      User.rebuild(
        member.user.id,
        member.user.name,
        member.user.email,
        UserStatus.Enrolled,
      ),
    );

    if (members.length < 3) {
      return null;
    }

    try {
      return Team.rebuild(teamData.id, new TeamName(teamData.name), members);
    } catch {
      return null;
    }
  }

  async findByName(name: TeamName): Promise<Team | null> {
    return this.findTeamByCondition({ name: name.getValue() });
  }

  async findById(id: string): Promise<Team | null> {
    return this.findTeamByCondition({ id });
  }

  async save(team: Team): Promise<void> {
    const teamId = team.getTeamId();
    const teamName = team.getName();
    const members = team.getMembers();
    const pairs = team.getPairs();

    await this.prisma.$transaction(async tx => {
      // チームの保存・更新
      await tx.team.upsert({
        where: { id: teamId },
        create: {
          id: teamId,
          name: teamName,
          members: {
            create: members.map(member => ({
              id: randomUUID(),
              userId: member.getUserId(),
              role: 'MEMBER',
            })),
          },
        },
        update: {
          name: teamName,
          members: {
            deleteMany: {},
            create: members.map(member => ({
              id: randomUUID(),
              userId: member.getUserId(),
              role: 'MEMBER',
            })),
          },
        },
      });

      // 既存のペアのメンバーを削除
      await tx.userPair.deleteMany({
        where: { pair: { teamId } },
      });

      // 既存のペアを削除
      await tx.pair.deleteMany({
        where: { teamId },
      });

      // 新しいペアを作成
      for (const pair of pairs) {
        const pairId = randomUUID();
        await tx.pair.create({
          data: {
            id: pairId,
            name: pair.getName().getValue(),
            teamId: teamId,
            members: {
              create: pair.getMembers().map(member => ({
                id: randomUUID(),
                userId: member.getUserId(),
              })),
            },
          },
        });
      }
    });
  }
}
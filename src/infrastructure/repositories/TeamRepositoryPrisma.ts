import { PrismaClient } from '@prisma/client';
import { Team } from '../../domain/team/Team';
import { ITeamRepository } from '../../domain/team/ITeamRepository';
import { TeamName } from '../../domain/team/vo/TeamName';

export class TeamRepositoryPrisma implements ITeamRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByName(name: TeamName): Promise<Team | null> {
    const team = await this.prisma.team.findUnique({
      where: { name: name.getValue() },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!team) {
      return null;
    }

    const members = team.members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      status: 'Enrolled', // TODO: ユーザーのステータスをDBから取得する実装に修正
    }));

    return Team.rebuild(
      team.id,
      name,
      members
    );
  }

  async findById(id: string): Promise<Team | null> {
    const team = await this.prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!team) {
      return null;
    }

    const members = team.members.map(member => ({
      id: member.user.id,
      name: member.user.name,
      status: 'Enrolled', // TODO: ユーザーのステータスをDBから取得する実装に修正
    }));

    return Team.rebuild(
      team.id,
      TeamName.create(team.name),
      members
    );
  }

  async save(team: Team): Promise<void> {
    const teamId = team.getTeamId();
    const teamName = team.getName();
    const members = team.getMembers();

    await this.prisma.team.upsert({
      where: { id: teamId },
      create: {
        id: teamId,
        name: teamName,
      },
      update: {
        name: teamName,
      },
    });

    const currentMembers = await this.prisma.teamUser.findMany({
      where: { teamId },
      select: { userId: true },
    });
    const currentMemberIds = new Set(currentMembers.map(m => m.userId));

    const newMemberIds = members.map(m => m.id);
    const membersToAdd = newMemberIds.filter(id => !currentMemberIds.has(id));
    const membersToRemove = Array.from(currentMemberIds).filter(id => !newMemberIds.includes(id));

    await this.prisma.$transaction([
      this.prisma.teamUser.deleteMany({
        where: {
          teamId,
          userId: { in: membersToRemove },
        },
      }),
      this.prisma.teamUser.createMany({
        data: membersToAdd.map(userId => ({
          teamId,
          userId,
          role: 'MEMBER',
        })),
        skipDuplicates: true,
      }),
    ]);
  }
}
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';
import { ITeamRepository } from '../../domain/team/ITeamRepository';
import { Team } from '../../domain/team/Team';
import { TeamName } from '../../domain/team/vo/TeamName';
import { User } from '../../domain/user/User';
import { UserStatus } from '../../domain/user/enums/UserStatus';

export class TeamRepositoryPrisma implements ITeamRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByName(name: TeamName): Promise<Team | null> {
    const teamData = await this.prisma.team.findUnique({
      where: {
        name: name.getValue(),
      },
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

  async save(team: Team): Promise<void> {
    const teamId = team.getTeamId();
    const teamName = team.getName();
    const members = team.getMembers();

    await this.prisma.$transaction(async tx => {
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
    });
  }
}
import { PrismaClient } from '@prisma/client';
import { ITeamRepository } from '../../domain/team/ITeamRepository';
import { Team } from '../../domain/team/Team';
import { TeamName } from '../../domain/team/vo/TeamName';
import { Pair } from '../../domain/team/Pair';
import { PairLabel } from '../../domain/team/vo/PairLabel';
import { User } from '../../domain/user/User';
import { Email } from '../../domain/shared/Email';
import { UserStatus } from '../../domain/user/enums/UserStatus';

const prisma = new PrismaClient();

export class TeamRepositoryPrisma implements ITeamRepository {
  async save(team: Team): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // チームの保存
      await tx.team.upsert({
        where: { id: team.getId() },
        update: {
          name: team.getName().getValue(),
        },
        create: {
          id: team.getId(),
          name: team.getName().getValue(),
        },
      });

      // メンバーの削除
      await tx.teamMember.deleteMany({
        where: { teamId: team.getId() },
      });

      // メンバーの保存
      for (const member of team.getMembers()) {
        await tx.teamMember.create({
          data: {
            id: crypto.randomUUID(),
            teamId: team.getId(),
            userId: member.getId(),
          },
        });
      }

      // ペアの削除
      await tx.pairMember.deleteMany({
        where: { pair: { teamId: team.getId() } },
      });
      await tx.pair.deleteMany({
        where: { teamId: team.getId() },
      });

      // ペアの保存
      for (const pair of team.getPairs()) {
        await tx.pair.create({
          data: {
            id: pair.getId(),
            teamId: team.getId(),
            label: pair.getLabel().getValue(),
          },
        });

        for (const member of pair.getMembers()) {
          await tx.pairMember.create({
            data: {
              id: crypto.randomUUID(),
              pairId: pair.getId(),
              userId: member.getId(),
            },
          });
        }
      }
    });
  }

  async findById(id: string): Promise<Team | null> {
    const team = await prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        pairs: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return null;
    }

    const users = team.members.map((member) =>
      User.reconstruct(
        member.user.id,
        member.user.email,
        member.user.status as any,
      ),
    );

    const pairs = team.pairs.map((pair) => ({
      id: pair.id,
      label: pair.label,
      members: pair.members.map((member) =>
        User.reconstruct(
          member.user.id,
          member.user.email,
          member.user.status as any,
        ),
      ),
    }));

    return Team.reconstruct(
      team.id,
      TeamName.create(team.name),
      users,
      pairs.map((p) => ({
        id: p.id,
        label: PairLabel.create(p.label),
        members: p.members,
      })),
    );
  }

  async findByName(name: TeamName): Promise<Team | null> {
    const team = await prisma.team.findUnique({
      where: { name: name.getValue() },
      include: {
        members: {
          include: {
            user: true,
          },
        },
        pairs: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    if (!team) {
      return null;
    }

    const users = team.members.map((member) =>
      User.reconstruct(
        member.user.id,
        member.user.email,
        member.user.status as any,
      ),
    );

    const pairs = team.pairs.map((pair) => ({
      id: pair.id,
      label: pair.label,
      members: pair.members.map((member) =>
        User.reconstruct(
          member.user.id,
          member.user.email,
          member.user.status as any,
        ),
      ),
    }));

    return Team.reconstruct(
      team.id,
      TeamName.create(team.name),
      users,
      pairs.map((p) => ({
        id: p.id,
        label: PairLabel.create(p.label),
        members: p.members,
      })),
    );
  }

  async findAll(): Promise<Team[]> {
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: true,
          },
        },
        pairs: {
          include: {
            members: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    return Promise.all(teams.map(team => this.reconstructTeam(team)));
  }

  async delete(id: string): Promise<void> {
    try {
      await prisma.team.delete({
        where: { id },
      });
    } catch (error: unknown) {
      if (error instanceof Error && 'code' in error && error.code === 'P2025') {
        return;
      }
      throw error;
    }
  }

  private async reconstructTeam(teamData: any): Promise<Team> {
    const team = Team.create(
      teamData.id,
      TeamName.create(teamData.name),
    );

    // メンバーの復元
    for (const memberData of teamData.members) {
      const user = User.create(
        memberData.user.id,
        Email.create(memberData.user.email),
        memberData.user.status as UserStatus,
      );
      team.addMember(user);
    }

    // ペアの復元
    for (const pairData of teamData.pairs) {
      const pair = Pair.create(
        pairData.id,
        PairLabel.create(pairData.label),
      );

      for (const memberData of pairData.members) {
        const user = User.create(
          memberData.user.id,
          Email.create(memberData.user.email),
          memberData.user.status as UserStatus,
        );
        pair.addMember(user);
      }

      team.addPair(pair);
    }

    return team;
  }
} 
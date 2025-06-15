import { TeamRepositoryPrisma } from '../../../infrastructure/repositories/TeamRepositoryPrisma';
import { Team } from '../../../domain/team/Team';
import { TeamName } from '../../../domain/team/vo/TeamName';
import { User } from '../../../domain/user/User';
import { Email } from '../../../domain/shared/Email';
import { Pair } from '../../../domain/team/Pair';
import { PairLabel } from '../../../domain/team/vo/PairLabel';
import prisma from '../../../infrastructure/prisma/client';

describe('TeamRepositoryPrisma', () => {
  let repository: TeamRepositoryPrisma;

  beforeEach(async () => {
    repository = new TeamRepositoryPrisma();
    await prisma.pairMember.deleteMany();
    await prisma.pair.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
    await prisma.user.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  const createTeam = () => {
    const team = Team.create('team-id', TeamName.create('T1'));
    const users = [
      User.create('user-1', Email.create('user1@example.com')),
      User.create('user-2', Email.create('user2@example.com')),
      User.create('user-3', Email.create('user3@example.com')),
    ];
    users.forEach(user => team.addMember(user));
    return { team, users };
  };

  describe('save', () => {
    it('should save a new team', async () => {
      const { team } = createTeam();
      await repository.save(team);

      const found = await prisma.team.findUnique({
        where: { id: team.getId() },
        include: {
          members: true,
          pairs: {
            include: {
              members: true,
            },
          },
        },
      });

      expect(found).not.toBeNull();
      expect(found?.name).toBe('T1');
      expect(found?.members).toHaveLength(3);
    });

    it('should save a team with pairs', async () => {
      const { team, users } = createTeam();
      const pair = Pair.create('pair-id', PairLabel.create('A'));
      pair.addMember(users[0]);
      pair.addMember(users[1]);
      team.addPair(pair);

      await repository.save(team);

      const found = await prisma.team.findUnique({
        where: { id: team.getId() },
        include: {
          pairs: {
            include: {
              members: true,
            },
          },
        },
      });

      expect(found?.pairs).toHaveLength(1);
      expect(found?.pairs[0].label).toBe('A');
      expect(found?.pairs[0].members).toHaveLength(2);
    });
  });

  describe('findById', () => {
    it('should find a team by id', async () => {
      const { team } = createTeam();
      await repository.save(team);

      const found = await repository.findById(team.getId());

      expect(found).not.toBeNull();
      expect(found?.getId()).toBe(team.getId());
      expect(found?.getName().getValue()).toBe('T1');
      expect(found?.getMembers()).toHaveLength(3);
    });

    it('should return null for non-existent id', async () => {
      const found = await repository.findById('non-existent-id');
      expect(found).toBeNull();
    });
  });

  describe('findByName', () => {
    it('should find a team by name', async () => {
      const { team } = createTeam();
      await repository.save(team);

      const found = await repository.findByName(TeamName.create('T1'));

      expect(found).not.toBeNull();
      expect(found?.getId()).toBe(team.getId());
      expect(found?.getName().getValue()).toBe('T1');
    });

    it('should return null for non-existent name', async () => {
      const found = await repository.findByName(TeamName.create('XX'));
      expect(found).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should find all teams', async () => {
      const team1 = Team.create('team-1', TeamName.create('T1'));
      const team2 = Team.create('team-2', TeamName.create('T2'));
      await Promise.all([
        repository.save(team1),
        repository.save(team2),
      ]);

      const found = await repository.findAll();

      expect(found).toHaveLength(2);
      expect(found.map(t => t.getId())).toContain(team1.getId());
      expect(found.map(t => t.getId())).toContain(team2.getId());
    });

    it('should return empty array when no teams exist', async () => {
      const found = await repository.findAll();
      expect(found).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('should delete a team', async () => {
      const { team } = createTeam();
      await repository.save(team);

      await repository.delete(team.getId());

      const found = await prisma.team.findUnique({
        where: { id: team.getId() },
      });
      expect(found).toBeNull();
    });

    it('should not throw error when deleting non-existent team', async () => {
      await expect(repository.delete('non-existent-id'))
        .resolves
        .not.toThrow();
    });
  });
}); 
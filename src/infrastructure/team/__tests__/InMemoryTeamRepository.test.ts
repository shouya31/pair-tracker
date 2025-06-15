import { InMemoryTeamRepository } from '../InMemoryTeamRepository';
import { Team } from '../../../domain/team/Team';
import { TeamName } from '../../../domain/team/TeamName';
import { User } from '../../../domain/user/User';
import { Email } from '../../../domain/shared/Email';

describe('InMemoryTeamRepository', () => {
  let repository: InMemoryTeamRepository;
  let team: Team;
  let users: User[];

  beforeEach(() => {
    users = [
      new User(new Email('user1@example.com')),
      new User(new Email('user2@example.com')),
      new User(new Email('user3@example.com'))
    ];
    team = new Team(new TeamName('ABC'), users);
    repository = new InMemoryTeamRepository();
  });

  describe('save', () => {
    it('チームを保存して返す', async () => {
      const savedTeam = await repository.save(team);
      expect(savedTeam).toBe(team);
    });

    it('同じIDのチームを上書きする', async () => {
      await repository.save(team);
      const updatedTeam = new Team(new TeamName('XYZ'), users);
      Object.defineProperty(updatedTeam, '_teamId', { value: team.teamId });
      
      const savedTeam = await repository.save(updatedTeam);
      const foundTeam = await repository.findById(team.teamId);
      
      expect(savedTeam).toBe(updatedTeam);
      expect(foundTeam).toBe(updatedTeam);
    });
  });

  describe('findById', () => {
    it('存在するチームを返す', async () => {
      await repository.save(team);
      const foundTeam = await repository.findById(team.teamId);
      expect(foundTeam).toBe(team);
    });

    it('存在しないチームの場合nullを返す', async () => {
      const foundTeam = await repository.findById('non-existent-id');
      expect(foundTeam).toBeNull();
    });
  });

  describe('findByName', () => {
    it('存在するチームを返す', async () => {
      await repository.save(team);
      const foundTeam = await repository.findByName(team.name);
      expect(foundTeam).toBe(team);
    });

    it('存在しないチーム名の場合nullを返す', async () => {
      const foundTeam = await repository.findByName(new TeamName('XYZ'));
      expect(foundTeam).toBeNull();
    });
  });

  describe('findTeamsWithMember', () => {
    it('メンバーが所属するチームを返す', async () => {
      await repository.save(team);
      const teams = await repository.findTeamsWithMember(users[0].userId);
      expect(teams).toHaveLength(1);
      expect(teams[0]).toBe(team);
    });

    it('メンバーが所属しないチームは返さない', async () => {
      await repository.save(team);
      const teams = await repository.findTeamsWithMember('non-existent-id');
      expect(teams).toHaveLength(0);
    });
  });

  describe('findAll', () => {
    it('全てのチームを返す', async () => {
      const team2 = new Team(new TeamName('XYZ'), users);
      await repository.save(team);
      await repository.save(team2);

      const teams = await repository.findAll();
      expect(teams).toHaveLength(2);
      expect(teams).toContain(team);
      expect(teams).toContain(team2);
    });

    it('チームが存在しない場合は空配列を返す', async () => {
      const teams = await repository.findAll();
      expect(teams).toHaveLength(0);
    });
  });

  describe('delete', () => {
    it('チームを削除する', async () => {
      await repository.save(team);
      await repository.delete(team.teamId);
      const foundTeam = await repository.findById(team.teamId);
      expect(foundTeam).toBeNull();
    });

    it('存在しないチームの削除を許容する', async () => {
      await expect(repository.delete('non-existent-id')).resolves.not.toThrow();
    });
  });
}); 
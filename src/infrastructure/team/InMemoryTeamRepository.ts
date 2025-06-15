import { Team } from '../../domain/team/Team';
import { TeamName } from '../../domain/team/TeamName';
import { ITeamRepository } from '../../domain/team/ITeamRepository';

export class InMemoryTeamRepository implements ITeamRepository {
  private teams: Map<string, Team> = new Map();

  async save(team: Team): Promise<Team> {
    this.teams.set(team.teamId, team);
    return team;
  }

  async findById(id: string): Promise<Team | null> {
    return this.teams.get(id) || null;
  }

  async findAll(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async delete(id: string): Promise<void> {
    this.teams.delete(id);
  }

  async findByName(name: TeamName): Promise<Team | null> {
    return Array.from(this.teams.values())
      .find(team => team.name.toString() === name.toString()) || null;
  }

  async findTeamsWithMember(userId: string): Promise<Team[]> {
    return Array.from(this.teams.values())
      .filter(team => team.hasMember(userId));
  }
} 
import { ITeamRepository } from '../../domain/team/ITeamRepository';
import { Team } from '../../domain/team/Team';
import { TeamName } from '../../domain/team/vo/TeamName';

export class MockTeamRepository implements ITeamRepository {
  private teams: Team[] = [];

  async save(team: Team): Promise<void> {
    const index = this.teams.findIndex(t => t.getId() === team.getId());
    if (index !== -1) {
      this.teams[index] = team;
    } else {
      this.teams.push(team);
    }
  }

  async findById(id: string): Promise<Team | null> {
    return this.teams.find(t => t.getId() === id) || null;
  }

  async findByName(name: TeamName): Promise<Team | null> {
    return this.teams.find(t => t.getName().equals(name)) || null;
  }

  async findAll(): Promise<Team[]> {
    return [...this.teams];
  }

  async delete(id: string): Promise<void> {
    this.teams = this.teams.filter(t => t.getId() !== id);
  }

  // テスト用のヘルパーメソッド
  clear(): void {
    this.teams = [];
  }
} 
import { Team } from './Team';
import { TeamName } from './vo/TeamName';

export interface ITeamRepository {
  findByName(name: TeamName): Promise<Team | null>;

  findById(id: string): Promise<Team | null>;

  findAll(): Promise<Team[]>;

  save(team: Team): Promise<void>;
}
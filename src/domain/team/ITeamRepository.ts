import { Team } from './Team';
import { TeamName } from './vo/TeamName';

export interface ITeamRepository {
  save(team: Team): Promise<void>;
  findById(id: string): Promise<Team | null>;
  findByName(name: TeamName): Promise<Team | null>;
  findAll(): Promise<Team[]>;
  delete(id: string): Promise<void>;
} 
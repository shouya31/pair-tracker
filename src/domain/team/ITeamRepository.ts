import { Team } from './Team';
import { TeamName } from './vo/TeamName';

export interface ITeamRepository {
  findByName(name: TeamName): Promise<Team | null>;

  save(team: Team): Promise<void>;
}
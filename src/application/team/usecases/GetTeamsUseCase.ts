import { ITeamRepository } from '@/domain/team/ITeamRepository';

export interface TeamMemberDTO {
  id: string;
  name: string;
}

export interface TeamDTO {
  id: string;
  name: string;
  members: TeamMemberDTO[];
}

export class GetTeamsUseCase {
  constructor(
    private readonly teamRepository: ITeamRepository,
  ) {}

  async execute(): Promise<TeamDTO[]> {
    const teams = await this.teamRepository.findAll();
    return teams.map(team => ({
      id: team.getTeamId(),
      name: team.getName(),
      members: team.getMembers().map(member => ({
        id: member.id,
        name: member.name || ''
      }))
    }));
  }
} 
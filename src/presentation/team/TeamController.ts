import { CreateTeamUseCase } from '../../application/team/CreateTeamUseCase';
import { CreatePairUseCase } from '../../application/team/CreatePairUseCase';

interface CreateTeamRequest {
  name: string;
  memberIds: string[];
}

interface CreatePairRequest {
  teamId: string;
  label: string;
  memberIds: string[];
}

interface ApiResponse<T> {
  statusCode: number;
  body: T | { error: string };
}

export class TeamController {
  constructor(
    private readonly createTeamUseCase: CreateTeamUseCase,
    private readonly createPairUseCase: CreatePairUseCase
  ) {}

  async createTeam(request: CreateTeamRequest): Promise<ApiResponse<{ name: string; members: string[] }>> {
    try {
      const team = await this.createTeamUseCase.execute(request.name, request.memberIds);
      return {
        statusCode: 201,
        body: {
          name: team.name.value,
          members: team.members.map(m => m.userId)
        }
      };
    } catch (error) {
      return {
        statusCode: 400,
        body: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  async createPair(request: CreatePairRequest): Promise<ApiResponse<{ label: string; members: string[] }>> {
    try {
      const pair = await this.createPairUseCase.execute(request.teamId, request.label, request.memberIds);
      return {
        statusCode: 201,
        body: {
          label: pair.label.value,
          members: pair.members.map(m => m.userId)
        }
      };
    } catch (error) {
      return {
        statusCode: 400,
        body: {
          error: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }
} 
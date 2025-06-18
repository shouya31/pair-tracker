import { ITeamRepository } from '../../../domain/team/ITeamRepository';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { Team } from '../../../domain/team/Team';
import { TeamName } from '../../../domain/team/vo/TeamName';
import { DuplicateTeamNameError } from '../../../domain/team/errors/DuplicateTeamNameError';

interface CreateTeamUseCaseInput {
  name: string;
  memberIds: string[];
}

export class CreateTeamUseCase {
  constructor(
    private readonly teamRepository: ITeamRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: CreateTeamUseCaseInput): Promise<void> {
    const teamName = new TeamName(input.name);
    const existingTeam = await this.teamRepository.findByName(teamName);
    if (existingTeam) {
      throw new DuplicateTeamNameError(teamName.getValue());
    }

    const memberPromises = input.memberIds.map(async (id) => {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new Error(`ユーザーID "${id}" が見つかりません`);
      }
      return user;
    });
    const members = await Promise.all(memberPromises);
    const team = Team.create(teamName, members);

    await this.teamRepository.save(team);
  }
}
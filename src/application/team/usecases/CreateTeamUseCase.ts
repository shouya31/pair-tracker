import { ITeamRepository } from '../../../domain/team/ITeamRepository';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { Team } from '../../../domain/team/Team';
import { TeamName } from '../../../domain/team/vo/TeamName';
import { DuplicateTeamNameError, UserNotFoundError, InvalidUserStatusError } from '../errors/TeamErrors';
import { UserStatus } from '../../../domain/user/enums/UserStatus';

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
    const teamName = TeamName.create(input.name);
    const existingTeam = await this.teamRepository.findByName(teamName);
    if (existingTeam) {
      throw new DuplicateTeamNameError(teamName.getValue());
    }

    const users = await this.userRepository.findByIds(input.memberIds);
    if (users.length !== input.memberIds.length) {
      const foundUserIds = new Set(users.map(u => u.getUserId()));
      const notFoundId = input.memberIds.find(id => !foundUserIds.has(id));
      throw new UserNotFoundError(notFoundId!);
    }

    const nonEnrolledUser = users.find(user => user.getStatus() !== UserStatus.Enrolled);
    if (nonEnrolledUser) {
      throw new InvalidUserStatusError(nonEnrolledUser.getName(), nonEnrolledUser.getStatus());
    }

    const team = Team.create(teamName, users.map(user => ({
      id: user.getUserId(),
      name: user.getName()
    })));

    await this.teamRepository.save(team);
  }
}
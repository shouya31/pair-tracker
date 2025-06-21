import { ITeamRepository } from '../../../domain/team/ITeamRepository';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { Team } from '../../../domain/team/Team';
import { TeamName } from '../../../domain/team/vo/TeamName';
import { Prisma } from '@prisma/client';
import { DuplicateTeamNameError, UserNotFoundError } from '../errors/TeamErrors';

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

    const memberPromises = input.memberIds.map(async (id) => {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new UserNotFoundError(id);
      }
      return user;
    });
    const members = await Promise.all(memberPromises);
    const team = Team.create(teamName, members);

    try {
      await this.teamRepository.save(team);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new DuplicateTeamNameError(teamName.getValue());
      }
      throw error;
    }
  }
}
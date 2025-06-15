import { v4 as uuidv4 } from 'uuid';
import { CreateTeamCommand } from '../commands/CreateTeamCommand';
import { ITeamRepository } from '../../../domain/team/ITeamRepository';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { Team } from '../../../domain/team/Team';
import { TeamName } from '../../../domain/team/vo/TeamName';
import { TeamDTO } from '../dto/TeamDTO';

export class CreateTeamUseCase {
  constructor(
    private readonly teamRepository: ITeamRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(command: CreateTeamCommand): Promise<TeamDTO> {
    const teamName = TeamName.create(command.name);

    // チーム名の重複チェック
    const existingTeam = await this.teamRepository.findByName(teamName);
    if (existingTeam) {
      throw new Error('Team with this name already exists');
    }

    // メンバーの存在チェック
    if (command.initialMemberIds.length < 3) {
      throw new Error('Team must have at least 3 members');
    }

    const members = await Promise.all(
      command.initialMemberIds.map(async (id) => {
        const user = await this.userRepository.findById(id);
        if (!user) {
          throw new Error(`User not found: ${id}`);
        }
        if (user.getStatus() !== 'Enrolled') {
          throw new Error(`User ${id} is not enrolled`);
        }
        return user;
      })
    );

    const team = Team.create(uuidv4(), teamName);
    members.forEach(member => team.addMember(member));

    await this.teamRepository.save(team);

    return TeamDTO.fromDomain(team);
  }
} 
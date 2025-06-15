import { Team } from '../../domain/team/Team';
import { TeamName } from '../../domain/team/TeamName';
import { ITeamRepository } from '../../domain/team/ITeamRepository';
import { IUserRepository } from '../../domain/user/IUserRepository';

export class CreateTeamUseCase {
  constructor(
    private readonly teamRepository: ITeamRepository,
    private readonly userRepository: IUserRepository
  ) {}

  async execute(name: string, memberIds: string[]): Promise<Team> {
    // チーム名の重複チェック
    const teamName = new TeamName(name);
    const existingTeam = await this.teamRepository.findByName(teamName);
    if (existingTeam) {
      throw new Error('Team name already exists');
    }

    // メンバーの存在チェック
    const members = await Promise.all(
      memberIds.map(async (id) => {
        const user = await this.userRepository.findById(id);
        if (!user) {
          throw new Error(`User not found: ${id}`);
        }
        return user;
      })
    );

    // チームの作成と保存
    const team = new Team(teamName, members);
    return this.teamRepository.save(team);
  }
} 
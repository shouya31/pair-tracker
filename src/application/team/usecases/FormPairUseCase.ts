import { ITeamRepository } from '../../../domain/team/ITeamRepository';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { TeamNotFoundError, UserNotFoundError } from '../errors/TeamErrors';
import { PairName } from '../../../domain/team/vo/PairName';

export class FormPairUseCase {
  constructor(
    private readonly teamRepository: ITeamRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(teamId: string, memberIds: string[], pairName: string): Promise<void> {
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new TeamNotFoundError(`チームが見つかりません。チームID: ${teamId}`);
    }

    // TODO:ユーザーの存在チェックも含め、ペア結成に関する全ての検証をTeam Entityに任せる。
    const memberPromises = memberIds.map(async (id) => {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new UserNotFoundError(`ユーザーが見つかりません。ユーザーID: ${id}`);
      }
    });
    await Promise.all(memberPromises);

    team.formPair(memberIds, new PairName(pairName));

    await this.teamRepository.save(team);
  }
}
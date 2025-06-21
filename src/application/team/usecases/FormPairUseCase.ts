import { ITeamRepository } from '../../../domain/team/ITeamRepository';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { PairName } from '../../../domain/team/vo/PairName';
import { UserNotFoundError } from '../errors/TeamErrors';

export class FormPairUseCase {
  constructor(
    private readonly teamRepository: ITeamRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(teamId: string, memberIds: string[], pairName: string): Promise<void> {
    // チームの取得
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // メンバーの取得
    const memberPromises = memberIds.map(async (id) => {
      const user = await this.userRepository.findById(id);
      if (!user) {
        throw new UserNotFoundError(id);
      }
      return user;
    });
    const members = await Promise.all(memberPromises);

    // ペアの形成
    team.formPair(members, new PairName(pairName));

    // 変更の永続化
    await this.teamRepository.save(team);
  }
} 
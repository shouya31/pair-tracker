import { ITeamRepository } from '../../../domain/team/ITeamRepository';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { PairName } from '../../../domain/team/vo/PairName';
import { TeamNotFoundError } from '../errors/TeamErrors';
import { UserStatus } from '../../../domain/user/enums/UserStatus';

interface FormPairUseCaseInput {
  teamId: string;
  memberIds: string[];
  pairName: string;
}

export class FormPairUseCase {
  constructor(
    private readonly teamRepository: ITeamRepository,
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(input: FormPairUseCaseInput): Promise<void> {
    // 1. チームを取得
    const team = await this.teamRepository.findById(input.teamId);
    if (!team) {
      throw new TeamNotFoundError(input.teamId);
    }

    // 2. ペア形成をリクエスト
    team.requestPairFormation(input.memberIds, new PairName(input.pairName));

    // 3. メンバーのステータスを確認
    const users = await Promise.all(
      input.memberIds.map(id => this.userRepository.findById(id))
    );

    const invalidUsers = users.filter(user => user?.getStatus() !== UserStatus.Enrolled);
    if (invalidUsers.length > 0) {
      const invalidUserNames = invalidUsers
        .map(user => `${user?.getName()}(${user?.getStatus()})`)
        .join(', ');
      throw new Error(`在籍中でないメンバーはペアに所属できません: ${invalidUserNames}`);
    }

    // 4. ペア形成を確認
    team.confirmPairFormation(input.memberIds);

    // 5. 変更を永続化
    await this.teamRepository.save(team);
  }
}
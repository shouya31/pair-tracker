import { Team } from '../../domain/team/Team';
import { Pair } from '../../domain/team/Pair';
import { PairLabel } from '../../domain/team/PairLabel';
import { ITeamRepository } from '../../domain/team/ITeamRepository';

export class CreatePairUseCase {
  constructor(private readonly teamRepository: ITeamRepository) {}

  async execute(teamId: string, label: string, memberIds: string[]): Promise<Pair> {
    const team = await this.teamRepository.findById(teamId);
    if (!team) {
      throw new Error('Team not found');
    }

    // メンバーがチームに所属しているか確認
    memberIds.forEach(memberId => {
      if (!team.hasMember(memberId)) {
        throw new Error(`Member ${memberId} does not belong to the team`);
      }
    });

    // ペアを作成
    const pair = new Pair(new PairLabel(label), team.members.filter(m => memberIds.includes(m.userId)));
    team.addPair(pair);

    // チームを保存
    await this.teamRepository.save(team);

    return pair;
  }
} 
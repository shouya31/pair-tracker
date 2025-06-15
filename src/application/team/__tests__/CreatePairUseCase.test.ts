import { CreatePairUseCase } from '../CreatePairUseCase';
import { ITeamRepository } from '../../../domain/team/ITeamRepository';
import { Team } from '../../../domain/team/Team';
import { TeamName } from '../../../domain/team/TeamName';
import { User } from '../../../domain/user/User';
import { Email } from '../../../domain/shared/Email';

jest.mock('../../../domain/team/ITeamRepository');

describe('CreatePairUseCase', () => {
  let teamRepository: jest.Mocked<ITeamRepository>;
  let useCase: CreatePairUseCase;
  let team: Team;
  let member1: User;
  let member2: User;
  let member3: User;

  beforeEach(() => {
    teamRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByName: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn()
    } as jest.Mocked<ITeamRepository>;

    member1 = new User(new Email('member1@example.com'));
    member2 = new User(new Email('member2@example.com'));
    member3 = new User(new Email('member3@example.com'));
    team = new Team(new TeamName('ABC'), [member1, member2, member3]);

    useCase = new CreatePairUseCase(teamRepository);
  });

  it('ペアを作成できる', async () => {
    teamRepository.findById.mockResolvedValue(team);
    teamRepository.save.mockResolvedValue(team);

    const result = await useCase.execute(team.teamId, 'A', [member1.userId, member2.userId]);

    expect(result.label.value).toBe('A');
    expect(result.members).toHaveLength(2);
    expect(result.members).toContainEqual(member1);
    expect(result.members).toContainEqual(member2);
  });

  it('存在しないチームの場合エラーを返す', async () => {
    teamRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('non-existent-team', 'A', [member1.userId, member2.userId]))
      .rejects.toThrow('Team not found');
  });

  it('チームに所属していないメンバーを含む場合エラーを返す', async () => {
    const outsider = new User(new Email('outsider@example.com'));
    teamRepository.findById.mockResolvedValue(team);

    await expect(useCase.execute(team.teamId, 'A', [member1.userId, outsider.userId]))
      .rejects.toThrow(`Member ${outsider.userId} does not belong to the team`);
  });
}); 
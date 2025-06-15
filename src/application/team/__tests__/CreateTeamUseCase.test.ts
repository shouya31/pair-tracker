import { CreateTeamUseCase } from '../CreateTeamUseCase';
import { ITeamRepository } from '../../../domain/team/ITeamRepository';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { Team } from '../../../domain/team/Team';
import { TeamName } from '../../../domain/team/TeamName';
import { User } from '../../../domain/user/User';
import { Email } from '../../../domain/shared/Email';

jest.mock('../../../domain/team/ITeamRepository');
jest.mock('../../../domain/user/IUserRepository');

describe('CreateTeamUseCase', () => {
  let teamRepository: jest.Mocked<ITeamRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let useCase: CreateTeamUseCase;
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

    userRepository = {
      save: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findAll: jest.fn(),
      delete: jest.fn()
    } as jest.Mocked<IUserRepository>;

    member1 = new User(new Email('member1@example.com'));
    member2 = new User(new Email('member2@example.com'));
    member3 = new User(new Email('member3@example.com'));

    useCase = new CreateTeamUseCase(teamRepository, userRepository);
  });

  it('チームを作成できる', async () => {
    teamRepository.findByName.mockResolvedValue(null);
    userRepository.findById.mockImplementation(async (id) => {
      const members = [member1, member2, member3];
      return members.find(m => m.userId === id) || null;
    });
    teamRepository.save.mockImplementation(async (team) => team);

    const result = await useCase.execute('ABC', [member1.userId, member2.userId, member3.userId]);

    expect(result.name.value).toBe('ABC');
    expect(result.members).toHaveLength(3);
    expect(result.members).toContainEqual(member1);
    expect(result.members).toContainEqual(member2);
    expect(result.members).toContainEqual(member3);
  });

  it('重複するチーム名を拒否する', async () => {
    const existingTeam = new Team(new TeamName('ABC'), [member1, member2, member3]);
    teamRepository.findByName.mockResolvedValue(existingTeam);

    await expect(useCase.execute('ABC', [member1.userId, member2.userId, member3.userId]))
      .rejects.toThrow('Team name already exists');
  });

  it('存在しないユーザーIDを拒否する', async () => {
    teamRepository.findByName.mockResolvedValue(null);
    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('ABC', ['non-existent-id']))
      .rejects.toThrow('User not found: non-existent-id');
  });
}); 
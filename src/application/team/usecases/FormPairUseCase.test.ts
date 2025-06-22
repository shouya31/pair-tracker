import { FormPairUseCase } from './FormPairUseCase';
import { ITeamRepository } from '../../../domain/team/ITeamRepository';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { Team } from '../../../domain/team/Team';
import { TeamName } from '../../../domain/team/vo/TeamName';
import { User } from '../../../domain/user/User';
import { UserStatus } from '../../../domain/user/enums/UserStatus';
import { TeamNotFoundError } from '../errors/TeamErrors';

describe('FormPairUseCase', () => {
  let teamRepository: jest.Mocked<ITeamRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let useCase: FormPairUseCase;

  beforeEach(() => {
    teamRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<ITeamRepository>;

    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByIds: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<IUserRepository>;

    useCase = new FormPairUseCase(teamRepository, userRepository);
  });

  const setupValidTeam = () => {
    const team = Team.create(
      TeamName.create('A1'),
      [
        { id: '1', name: 'User 1' },
        { id: '2', name: 'User 2' },
        { id: '3', name: 'User 3' },
      ]
    );
    teamRepository.findById.mockResolvedValue(team);
    return team;
  };

  const setupValidUsers = () => {
    const user1 = {
      getUserId: () => '1',
      getName: () => 'User 1',
      getStatus: () => UserStatus.Enrolled,
    } as jest.Mocked<User>;

    const user2 = {
      getUserId: () => '2',
      getName: () => 'User 2',
      getStatus: () => UserStatus.Enrolled,
    } as jest.Mocked<User>;

    userRepository.findById.mockImplementation(async (id) => {
      if (id === '1') return user1;
      if (id === '2') return user2;
      return null;
    });

    return [user1, user2];
  };

  it('should form a pair when all conditions are met', async () => {
    const team = setupValidTeam();
    setupValidUsers();

    await useCase.execute({
      teamId: 'team-1',
      memberIds: ['1', '2'],
      pairName: 'A',
    });

    expect(teamRepository.save).toHaveBeenCalledWith(team);
    expect(team.getPairs()).toHaveLength(1);
  });

  it('should throw TeamNotFoundError when team does not exist', async () => {
    teamRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({
      teamId: 'non-existent-team',
      memberIds: ['1', '2'],
      pairName: 'A',
    })).rejects.toThrow(TeamNotFoundError);

    expect(teamRepository.save).not.toHaveBeenCalled();
  });

  it('should throw error when user is not enrolled', async () => {
    setupValidTeam();

    const withdrawnUser = {
      getUserId: () => '1',
      getName: () => 'User 1',
      getStatus: () => UserStatus.Withdrawn,
    } as jest.Mocked<User>;

    const enrolledUser = {
      getUserId: () => '2',
      getName: () => 'User 2',
      getStatus: () => UserStatus.Enrolled,
    } as jest.Mocked<User>;

    userRepository.findById.mockImplementation(async (id) => {
      if (id === '1') return withdrawnUser;
      if (id === '2') return enrolledUser;
      return null;
    });

    await expect(useCase.execute({
      teamId: 'team-1',
      memberIds: ['1', '2'],
      pairName: 'A',
    })).rejects.toThrow('在籍中でないメンバーはペアに所属できません');

    expect(teamRepository.save).not.toHaveBeenCalled();
  });
}); 
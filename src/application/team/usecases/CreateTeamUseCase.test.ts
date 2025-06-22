import { CreateTeamUseCase } from './CreateTeamUseCase';
import { ITeamRepository } from '../../../domain/team/ITeamRepository';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { User } from '../../../domain/user/User';
import { UserStatus } from '../../../domain/user/enums/UserStatus';
import { DuplicateTeamNameError, UserNotFoundError, InvalidUserStatusError } from '../errors/TeamErrors';
import { Team } from '../../../domain/team/Team';

describe('CreateTeamUseCase', () => {
  let teamRepository: jest.Mocked<ITeamRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let useCase: CreateTeamUseCase;

  const mockUsers = [
    User.rebuild('1', 'User 1', 'user1@example.com', UserStatus.Enrolled),
    User.rebuild('2', 'User 2', 'user2@example.com', UserStatus.Enrolled),
    User.rebuild('3', 'User 3', 'user3@example.com', UserStatus.Suspended),
    User.rebuild('4', 'User 4', 'user4@example.com', UserStatus.Enrolled),
  ];

  beforeEach(() => {
    teamRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<ITeamRepository>;

    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      findByIds: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    useCase = new CreateTeamUseCase(teamRepository, userRepository);
  });

  it('should create a team successfully with enrolled members', async () => {
    const input = {
      name: 'ABC',
      memberIds: ['1', '2', '4']
    };

    teamRepository.findByName.mockResolvedValue(null);
    userRepository.findByIds.mockResolvedValue([mockUsers[0], mockUsers[1], mockUsers[3]]);

    await useCase.execute(input);

    expect(teamRepository.save).toHaveBeenCalledWith(expect.any(Team));
  });

  it('should throw UserNotFoundError when a member does not exist', async () => {
    const input = {
      name: 'ABC',
      memberIds: ['1', '2', 'non-existent-id']
    };

    teamRepository.findByName.mockResolvedValue(null);
    userRepository.findByIds.mockResolvedValue([mockUsers[0], mockUsers[1]]);

    await expect(useCase.execute(input))
      .rejects
      .toThrow(UserNotFoundError);
  });

  it('should throw InvalidUserStatusError when a member is not enrolled', async () => {
    const input = {
      name: 'ABC',
      memberIds: ['1', '2', '3']
    };

    teamRepository.findByName.mockResolvedValue(null);
    userRepository.findByIds.mockResolvedValue([mockUsers[0], mockUsers[1], mockUsers[2]]);

    await expect(useCase.execute(input))
      .rejects
      .toThrow(InvalidUserStatusError);
    await expect(useCase.execute(input))
      .rejects
      .toThrow('在籍中でないメンバーはチームに所属できません: User 3(Suspended)');
  });

  it('should throw DuplicateTeamNameError when team name already exists', async () => {
    const input = {
      name: 'ABC',
      memberIds: ['1', '2', '4']
    };

    teamRepository.findByName.mockResolvedValue({} as Team);
    userRepository.findByIds.mockResolvedValue([mockUsers[0], mockUsers[1], mockUsers[3]]);

    await expect(useCase.execute(input))
      .rejects
      .toThrow(DuplicateTeamNameError);
  });
});
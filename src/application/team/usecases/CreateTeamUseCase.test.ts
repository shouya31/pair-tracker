import { CreateTeamUseCase } from './CreateTeamUseCase';
import { ITeamRepository } from '../../../domain/team/ITeamRepository';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { Team } from '../../../domain/team/Team';
import { TeamName } from '../../../domain/team/vo/TeamName';
import { User } from '../../../domain/user/User';
import { UserStatus } from '../../../domain/user/enums/UserStatus';
import { Prisma } from '@prisma/client';
import { DuplicateTeamNameError, UserNotFoundError } from '../errors/TeamErrors';

describe('CreateTeamUseCase', () => {
  let teamRepository: jest.Mocked<ITeamRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let useCase: CreateTeamUseCase;

  beforeEach(() => {
    teamRepository = {
      findByName: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<ITeamRepository>;

    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    useCase = new CreateTeamUseCase(teamRepository, userRepository);
  });

  const createMockUser = (id: string, status: UserStatus = UserStatus.Enrolled): User => {
    return User.rebuild(
      id,
      `User ${id}`,
      `user${id}@example.com`,
      status
    );
  };

  it('should create a team successfully', async () => {
    const input = {
      name: 'ABC',
      memberIds: ['1', '2', '3'],
    };

    userRepository.findById.mockImplementation((id) => 
      Promise.resolve(createMockUser(id))
    );

    await useCase.execute(input);

    expect(userRepository.findById).toHaveBeenCalledTimes(3);
    expect(teamRepository.save).toHaveBeenCalledWith(expect.any(Team));
  });

  it('should throw DuplicateTeamNameError when team name already exists', async () => {
    const input = {
      name: 'ABC',
      memberIds: ['1', '2', '3'],
    };

    userRepository.findById.mockImplementation((id) => 
      Promise.resolve(createMockUser(id))
    );

    teamRepository.save.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint violation', {
        code: 'P2002',
        clientVersion: '1.0.0',
      })
    );

    await expect(useCase.execute(input)).rejects.toThrow(DuplicateTeamNameError);
    await expect(useCase.execute(input)).rejects.toThrow('チーム名 "ABC" は既に使用されています');
  });

  it('should throw UserNotFoundError when user does not exist', async () => {
    const input = {
      name: 'ABC',
      memberIds: ['1', '2', '3'],
    };

    userRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(input)).rejects.toThrow(UserNotFoundError);
    await expect(useCase.execute(input)).rejects.toThrow('ユーザーID "1" が見つかりません');
  });

  it('should throw error when team has less than 3 members', async () => {
    const input = {
      name: 'ABC',
      memberIds: ['1', '2'],
    };

    userRepository.findById.mockImplementation((id) => 
      Promise.resolve(createMockUser(id))
    );

    await expect(useCase.execute(input)).rejects.toThrow('チームは3名以上のメンバーが必要です');
  });

  it('should throw error when team has non-enrolled members', async () => {
    const input = {
      name: 'ABC',
      memberIds: ['1', '2', '3'],
    };

    userRepository.findById.mockImplementation((id) => {
      if (id === '2') {
        return Promise.resolve(createMockUser(id, UserStatus.Withdrawn));
      }
      return Promise.resolve(createMockUser(id));
    });

    await expect(useCase.execute(input)).rejects.toThrow(/チームメンバーは全員が在籍中である必要があります/);
  });
});
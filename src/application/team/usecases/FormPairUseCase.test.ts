import { FormPairUseCase } from './FormPairUseCase';
import { ITeamRepository } from '../../../domain/team/ITeamRepository';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { Team } from '../../../domain/team/Team';
import { User } from '../../../domain/user/User';
import { TeamName } from '../../../domain/team/vo/TeamName';
import { UserStatus } from '../../../domain/user/enums/UserStatus';
import { TeamNotFoundError, UserNotFoundError } from '../errors/TeamErrors';

describe('FormPairUseCase', () => {
  let teamRepository: jest.Mocked<ITeamRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let useCase: FormPairUseCase;
  let mockTeam: Team;
  let mockUsers: User[];

  const TEAM_ID = '123e4567-e89b-42d3-a456-556642440000';
  const USER_IDS = [
    '123e4567-e89b-42d3-a456-556642440001',
    '123e4567-e89b-42d3-a456-556642440002',
    '123e4567-e89b-42d3-a456-556642440003',
  ];

  beforeEach(() => {
    // モックの初期化
    teamRepository = {
      findById: jest.fn(),
      findByName: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<ITeamRepository>;

    userRepository = {
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as jest.Mocked<IUserRepository>;

    // テスト用のユーザーを作成
    mockUsers = USER_IDS.map(id => 
      User.rebuild(id, `User ${id}`, `user${id}@example.com`, UserStatus.Enrolled)
    );

    // テスト用のチームを作成
    mockTeam = Team.rebuild(
      TEAM_ID,
      new TeamName('ABC'),
      mockUsers.map(user => ({
        id: user.getUserId(),
        name: user.getName(),
      }))
    );

    useCase = new FormPairUseCase(teamRepository, userRepository);
  });

  it('正常にペアが作成される', async () => {
    teamRepository.findById.mockResolvedValue(mockTeam);
    userRepository.findById.mockImplementation((id) =>
      Promise.resolve(mockUsers.find(u => u.getUserId() === id) || null)
    );

    await useCase.execute(TEAM_ID, [USER_IDS[0], USER_IDS[1]], 'A');

    expect(teamRepository.save).toHaveBeenCalled();
  });

  it('存在しないチームの場合はTeamNotFoundErrorを投げる', async () => {
    const nonExistentTeamId = '12345678-1234-4123-8123-123456789xyz';
    teamRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute(nonExistentTeamId, [USER_IDS[0], USER_IDS[1]], 'A')
    ).rejects.toThrow(`チームが見つかりません。チームID: ${nonExistentTeamId}`);
  });

  it('存在しないユーザーの場合はUserNotFoundErrorを投げる', async () => {
    const nonExistentUserId = '12345678-1234-4123-8123-123456789xyz';
    teamRepository.findById.mockResolvedValue(mockTeam);
    userRepository.findById.mockImplementation((id) =>
      Promise.resolve(mockUsers.find(u => u.getUserId() === id) || null)
    );

    await expect(
      useCase.execute(TEAM_ID, [mockUsers[0].getUserId(), nonExistentUserId], 'A')
    ).rejects.toThrow(`ユーザーが見つかりません。ユーザーID: ${nonExistentUserId}`);
  });
}); 
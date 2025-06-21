import { FormPairUseCase } from './FormPairUseCase';
import { ITeamRepository } from '../../../domain/team/ITeamRepository';
import { IUserRepository } from '../../../domain/user/IUserRepository';
import { Team } from '../../../domain/team/Team';
import { User } from '../../../domain/user/User';
import { TeamName } from '../../../domain/team/vo/TeamName';
import { UserStatus } from '../../../domain/user/enums/UserStatus';
import { UserNotFoundError, TeamNotFoundError } from '../errors/TeamErrors';

describe('FormPairUseCase', () => {
  let teamRepository: jest.Mocked<ITeamRepository>;
  let userRepository: jest.Mocked<IUserRepository>;
  let useCase: FormPairUseCase;
  let mockTeam: Team;
  let mockUsers: User[];

  const TEAM_ID = '12345678-1234-4123-8123-123456789012';
  const USER_IDS = [
    '12345678-1234-4123-8123-123456789abc',
    '12345678-1234-4123-8123-123456789def',
    '12345678-1234-4123-8123-123456789ghi',
    '12345678-1234-4123-8123-123456789jkl',
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
    mockUsers = [
      User.rebuild(USER_IDS[0], 'User 1', 'user1@example.com', UserStatus.Enrolled),
      User.rebuild(USER_IDS[1], 'User 2', 'user2@example.com', UserStatus.Enrolled),
    ];

    // テスト用のチームを作成
    mockTeam = Team.rebuild(
      TEAM_ID,
      new TeamName('ABC'),
      [
        ...mockUsers,
        User.rebuild(USER_IDS[2], 'User 3', 'user3@example.com', UserStatus.Enrolled),
        User.rebuild(USER_IDS[3], 'User 4', 'user4@example.com', UserStatus.Enrolled),
      ]
    );

    useCase = new FormPairUseCase(teamRepository, userRepository);
  });

  it('ペアを正常に形成できる', async () => {
    // モックの設定
    teamRepository.findById.mockResolvedValue(mockTeam);
    mockUsers.forEach(user => {
      userRepository.findById.mockResolvedValueOnce(user);
    });

    // テストの実行
    await useCase.execute(TEAM_ID, [USER_IDS[0], USER_IDS[1]], 'A');

    // 検証
    expect(teamRepository.findById).toHaveBeenCalledWith(TEAM_ID);
    expect(userRepository.findById).toHaveBeenCalledWith(USER_IDS[0]);
    expect(userRepository.findById).toHaveBeenCalledWith(USER_IDS[1]);
    expect(teamRepository.save).toHaveBeenCalledWith(expect.any(Team));
  });

  it('存在しないチームの場合はTeamNotFoundErrorを投げる', async () => {
    const nonExistentTeamId = '12345678-1234-4123-8123-123456789xyz';
    // モックの設定
    teamRepository.findById.mockResolvedValue(null);

    // テストの実行と検証
    await expect(
      useCase.execute(nonExistentTeamId, [USER_IDS[0], USER_IDS[1]], 'A')
    ).rejects.toThrow(TeamNotFoundError);
    await expect(
      useCase.execute(nonExistentTeamId, [USER_IDS[0], USER_IDS[1]], 'A')
    ).rejects.toThrow(`チームID "${nonExistentTeamId}" が見つかりません`);
  });

  it('存在しないユーザーの場合はUserNotFoundErrorを投げる', async () => {
    const nonExistentUserId = '12345678-1234-4123-8123-123456789xyz';
    
    // モックの設定
    teamRepository.findById.mockResolvedValue(mockTeam);
    userRepository.findById
      .mockImplementation((id) => {
        if (id === nonExistentUserId) {
          return Promise.resolve(null);
        }
        return Promise.resolve(mockUsers[0]);
      });

    // テストの実行と検証
    await expect(
      useCase.execute(TEAM_ID, [mockUsers[0].getUserId(), nonExistentUserId], 'A')
    ).rejects.toThrow(UserNotFoundError);
    await expect(
      useCase.execute(TEAM_ID, [mockUsers[0].getUserId(), nonExistentUserId], 'A')
    ).rejects.toThrow(`ユーザーID "${nonExistentUserId}" が見つかりません`);
  });
}); 